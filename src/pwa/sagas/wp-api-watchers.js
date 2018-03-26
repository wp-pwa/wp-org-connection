/* eslint-disable no-underscore-dangle, no-undef */
import Wpapi from 'wpapi';
import { normalize } from 'normalizr';
import { forOwn } from 'lodash';
import { call, select, put, takeEvery, all } from 'redux-saga/effects';
import { dep } from 'worona-deps';
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

export const getList = ({ connection, type, id, page }) => {
  const endpoint = typesToEndpoints('post');
  const params = { _embed: true };

  if (['category', 'tag', 'author'].includes(type)) {
    params[typesToParams(type)] = id;
  }

  let query = connection[endpoint]().page(page);

  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });

  return query;
};

export const getSingle = ({ connection, type, id }) =>
  connection[typesToEndpoints(type)]()
    .id(id)
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

export const listRequested = connection =>
  function* listRequestedSaga({ list: { type, id, page } }) {
    if (!['latest', 'category', 'tag', 'author'].includes(type)) {
      throw new Error(
        'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.',
      );
    }

    try {
      const response = yield call(getList, { connection, type, id, page });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };

      yield put(
        actions.listSucceed({
          list: {
            type,
            id,
            page,
          },
          entities,
          result,
          total,
          endpoint: getList({ connection, type, id, page }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.listFailed({
          list: {
            type,
            id,
            page,
          },
          error,
          endpoint: getList({ connection, type, id, page }).toString(),
        }),
      );
    }
  };

export const entityRequested = connection =>
  function* entityRequestedSaga({ entity: { type, id } }) {
    try {
      const response = yield call(getSingle, { connection, type, id });
      const { entities } = normalize(response, schemas.single);

      yield put(
        actions.singleSucceed({
          entity: {
            type,
            id,
          },
          entities,
          endpoint: getSingle({ connection, type, id }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.singleFailed({
          entity: {
            type,
            id,
          },
          error,
          endpoint: getSingle({ connection, type, id }).toString(),
        }),
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
          entities,
          endpoint: getCustom({ connection, singleType, page, params }).toString(),
        }),
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
          endpoint: getCustom({ connection, singleType, page, params }).toString(),
        }),
      );
    }
  };

export const routeChangeSucceed = stores =>
  function* routeChangeSucceedSaga(action) {
    const { connection } = stores;

    if (action.selectedItem.page) {
      const { type, id, page } = action.selectedItem;
      const listPage = connection.list(type, id).page(page - 1);

      if (listPage.ready === false && listPage.fetching === false) {
        yield put(actions.listRequested({ list: { type, id, page } }));
      }
    } else {
      const { type, id } = action.selectedItem;
      const entity = connection.entity(type, id);

      if (entity.ready === false && entity.fetching === false) {
        yield put(actions.entityRequested({ entity: { type, id } }));
      }
    }
  };

export const siteInfoRequested = connection =>
  function* siteInfoRequestedSaga() {
    try {
      const data = yield call([connection, 'siteInfo']);

      yield put(
        actions.siteInfoSucceed({
          home: data.home,
          perPage: data.perPage,
        }),
      );
    } catch (error) {
      yield put(actions.siteInfoFailed({ error }));
    }
  };

export default function* wpApiWatchersSaga(stores) {
  const connection = yield call(initConnection);
  yield all([
    takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, routeChangeSucceed(stores)),
    takeEvery(actionTypes.ENTITY_REQUESTED, entityRequested(connection)),
    takeEvery(actionTypes.LIST_REQUESTED, listRequested(connection)),
    takeEvery(actionTypes.CUSTOM_REQUESTED, customRequested(connection)),
    takeEvery(actionTypes.SITE_INFO_REQUESTED, siteInfoRequested(connection)),
  ]);
}
