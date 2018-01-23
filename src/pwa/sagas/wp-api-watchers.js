/* eslint-disable no-underscore-dangle, no-undef */
import Wpapi from 'wpapi';
import { normalize } from 'normalizr';
import { forOwn } from 'lodash';
import { call, select, put, takeEvery, all } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import request from 'superagent';
import { parse } from 'himalaya';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';
import * as schemas from '../schemas';
import { typesToEndpoints, typesToParams } from '../constants';

const CorsAnywhere = 'https://cors.worona.io/';

export function* isCors() {
  // If this is the server, isCors is not needed.
  if (typeof window === 'undefined') return false;
  const getSetting = dep('settings', 'selectorCreators', 'getSetting');
  const url = yield select(getSetting('generalSite', 'url'));
  // Only in case of a https connection and a http WordPres, cors is needed.
  return url.startsWith('http://') && window.location.host === 'https';
}

export function* initConnection() {
  const cors = yield call(isCors);
  const getSetting = dep('settings', 'selectorCreators', 'getSetting');
  const url = yield select(getSetting('generalSite', 'url'));
  const connection = new Wpapi({ endpoint: `${cors ? CorsAnywhere : ''}${url}?rest_route=` });
  connection.siteInfo = connection.registerRoute('wp-pwa/v1', '/site-info');
  return connection;
}

export const getList = ({ connection, listType, listId, singleType, page }) => {
  const endpoint = typesToEndpoints(singleType);
  const params = { _embed: true };
  if (['category', 'tag', 'author'].includes(listType)) params[typesToParams(listType)] = listId;
  let query = connection[endpoint]().page(page);
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};

export const getSingle = ({ connection, singleType, singleId }) =>
  connection[typesToEndpoints(singleType)]()
    .id(singleId)
    .embed();

export const getCustom = ({ connection, singleType, page, params }) => {
  let query = connection[typesToEndpoints(singleType)]()
    .page(page)
    .embed();
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};

export const getHeadContent = headString => {
  const whitelist = [
    { tagName: 'title' },
    { tagName: 'meta', attributes: { name: 'description' } },
    { tagName: 'link', attributes: { rel: 'canonical' } }
  ];

  // Parses <head> content string to an array with 'himalaya'.
  const parsedHead = parse(headString);

  // Reduces parsed content to an object with a 'title', an array of 'meta'
  // and an array of 'link'.
  const content = parsedHead.reduce(
    (result, current) => {
      // Removes text, styles, scripts and comments.
      if (
        current.type !== 'element' ||
        (current.tagName !== 'title' && current.tagName !== 'meta' && current.tagName !== 'link')
      ) {
        return result;
      }

      // Reduces current to something easier to check.
      current.attributes = current.attributes.reduce((r, c) => {
        r[c.key] = c.value;

        return r;
      }, {});
      delete current.type;

      // Applies a whitelist with the content accepted.
      const passesWhitelist = whitelist.some(valid => {
        if (valid.tagName !== current.tagName) return false;

        if (valid.attributes) {
          if (current.attributes.length < 1) return false;

          const keys = Object.keys(valid.attributes);

          const sameAttributes = keys.every(
            key => current.attributes[key] === valid.attributes[key]
          );

          if (!sameAttributes) return false;

          return true;
        }

        return true;
      });

      // Checks if the item passed the whitelist and if that kind of item already exists
      // in the result, the previous one is substituted by the current item.
      if (passesWhitelist) {
        if (current.tagName === 'title') result.title = current;

        if (current.tagName === 'meta') {
          const indexOfCurrent = result.meta.findIndex(
            item => item.attributes.name === current.attributes.name
          );

          if (indexOfCurrent >= 0) {
            result.meta[indexOfCurrent] = current;
          } else {
            result.meta.push(current);
          }
        }

        if (current.tagName === 'link') {
          const indexOfCurrent = result.link.findIndex(
            item => item.attributes.rel === current.attributes.rel
          );

          if (indexOfCurrent >= 0) {
            result.link[indexOfCurrent] = current;
          } else {
            result.link.push(current);
          }
        }
      }

      return result;
    },
    {
      title: null,
      meta: [],
      link: []
    }
  );

  return [content.title].concat(content.meta).concat(content.link);
};

export const listRequested = connection =>
  function* listRequestedSaga({ listType, listId = null, page = 1 }) {
    const singleType = 'post';
    if (!['latest', 'category', 'tag', 'author'].includes(listType))
      throw new Error(
        'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.'
      );
    try {
      const response = yield call(getList, { connection, listType, listId, singleType, page });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };
      yield put(
        actions.listSucceed({
          entities,
          result: result.map(item => item.id),
          listType,
          listId,
          page,
          total,
          endpoint: getList({ connection, listType, listId, singleType, page }).toString()
        })
      );
    } catch (error) {
      yield put(
        actions.listFailed({
          listType,
          listId,
          page,
          error,
          endpoint: getList({ connection, listType, listId, singleType, page }).toString()
        })
      );
    }
  };

export const singleRequested = connection =>
  function* singleRequestedSaga({ singleType, singleId }) {
    try {
      const response = yield call(getSingle, { connection, singleType, singleId });
      const { entities } = normalize(response, schemas.single);
      yield put(actions.singleSucceed({ singleType, singleId, entities }));
    } catch (error) {
      yield put(
        actions.singleFailed({
          singleType,
          singleId,
          error,
          endpoint: getSingle({ connection, singleType, singleId }).toString()
        })
      );
    }
  };

export const customRequested = connection =>
  function* customRequestedSaga({ url, name, singleType, page, params }) {
    try {
      const response = yield call(getCustom, { connection, singleType, page, params });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };
      yield put(
        actions.customSucceed({
          url,
          name,
          singleType,
          total,
          page,
          params,
          result: result.map(item => item.id),
          entities
        })
      );
    } catch (error) {
      yield put(
        actions.customFailed({
          url,
          name,
          singleType,
          params,
          page,
          error,
          endpoint: getCustom({ connection, singleType, page, params }).toString()
        })
      );
    }
  };

export const routeChangeSucceed = stores =>
  function* routeChangeSucceedSaga(action) {
    if (action.selected.listType) {
      const { selected: { listType, listId, page } } = action;
      const listPage = stores.connection.list[listType][listId].page[page - 1];
      if (listPage.ready === false && listPage.fetching === false) {
        yield put(actions.listRequested({ listType, listId, page }));
      }
    } else if (action.selected.singleId) {
      const { selected: { singleType, singleId } } = action;
      const entity = stores.connection.single[singleType][singleId];
      if (entity.ready === false && entity.fetching === false) {
        yield put(actions.singleRequested({ singleType, singleId }));
      }
    }
  };

export const siteInfoRequested = connection =>
  function* siteInfoRequestedSaga() {
    try {
      const data = yield call([connection, 'siteInfo']);

      yield put(
        actions.siteInfoSucceed({
          home: {
            title: data.home.title,
            description: data.home.description
          },
          perPage: data.perPage
        })
      );
    } catch (error) {
      yield put(actions.siteInfoFailed({ error }));
    }
  };

export const headElementsRequested = () =>
  function* headElementsRequestedSaga() {
    try {
      const url = yield select(dep('build', 'selectors', 'getUrl'));
      const site = yield request(url);
      const headString = site.text.match(/<head>([\w\W]+)<\/head>/)[1];
      const headContent = getHeadContent(headString);

      yield put(
        actions.headElementsSucceed({
          content: headContent
        })
      );
    } catch (error) {
      yield put(actions.headElementsFailed({ error }));
    }
  };

export default function* wpApiWatchersSaga(stores) {
  const connection = yield call(initConnection);
  yield all([
    takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, routeChangeSucceed(stores)),
    takeEvery(actionTypes.SINGLE_REQUESTED, singleRequested(connection)),
    takeEvery(actionTypes.LIST_REQUESTED, listRequested(connection)),
    takeEvery(actionTypes.CUSTOM_REQUESTED, customRequested(connection)),
    takeEvery(actionTypes.SITE_INFO_REQUESTED, siteInfoRequested(connection)),
    takeEvery(actionTypes.HEAD_ELEMENTS_REQUESTED, headElementsRequested())
  ]);
}
