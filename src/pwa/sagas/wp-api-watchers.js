/* eslint-disable no-underscore-dangle, no-undef */
import Wpapi from 'wpapi';
import { normalize } from 'normalizr';
import { forOwn } from 'lodash';
import { call, select, put, takeEvery, all, take } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';
import * as schemas from '../schemas';
import { typesToParams } from '../constants';

const CorsAnywhere = 'https://cors.worona.io/';

function* typesToEndpointsSaga() {
  const getSetting = dep('settings', 'selectorCreators', 'getSetting');
  const cptEndpoints = yield select(getSetting('connection', 'cptEndpoints')) || {};
  const endpoints = {
    post: 'posts',
    page: 'pages',
    category: 'categories',
    tag: 'tags',
    author: 'users',
    media: 'media',
    comment: 'comments',
    taxonomy: 'taxonomies',
    postType: 'types',
    postStatus: 'statuses',
    ...cptEndpoints,
  };

  return type => endpoints[type] || type;
}

export function* isCors() {
  // If this is the server, isCors is not needed.
  if (typeof window === 'undefined') return false;
  const getSetting = dep('settings', 'selectorCreators', 'getSetting');
  const url = yield select(getSetting('generalSite', 'url'));
  // Only in case of a https connection and a http WordPres, cors is needed.
  return url.startsWith('http://') && window.location.host === 'https';
}

export function* initConnection(options) {
  const cors = yield call(isCors);
  const getSetting = dep('settings', 'selectorCreators', 'getSetting');
  const siteUrl = yield select(getSetting('generalSite', 'url'));
  const autodiscovery = yield select(getSetting('connection', 'autodiscovery'));
  if (autodiscovery) {
    try {
      options.connection = yield call(Wpapi.discover, `${cors ? CorsAnywhere : ''}${siteUrl}`);
    } catch (e) {
      const apiUrl = `${siteUrl.replace(/\/$/, '')}/?rest_route=`;
      options.connection = new Wpapi({ endpoint: `${cors ? CorsAnywhere : ''}${apiUrl}` });
    }
  } else {
    const apiUrl = `${siteUrl.replace(/\/$/, '')}/?rest_route=`;
    options.connection = new Wpapi({ endpoint: `${cors ? CorsAnywhere : ''}${apiUrl}` });
  }
  options.typesToEndpoints = yield call(typesToEndpointsSaga);
}

export const getList = ({ connection, type, id, page, perPage, typesToEndpoints }) => {
  const endpoint = type === 'latest' ? typesToEndpoints(id) : typesToEndpoints('post');
  const params = { _embed: true, per_page: perPage };

  if (['category', 'tag', 'author'].includes(type)) {
    params[typesToParams(type)] = id;
  }

  let query = connection[endpoint]().page(page);

  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });

  return query;
};

export const getEntity = ({ connection, type, id, typesToEndpoints }) =>
  connection[typesToEndpoints(type)]()
    .id(id)
    .embed();

export const getCustom = ({ connection, type, page, params, typesToEndpoints }) => {
  let query = connection[typesToEndpoints(type)]()
    .page(page)
    .embed();

  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });

  return query;
};

export const listRequested = options =>
  function* listRequestedSaga({ list }) {
    const { type, id, page } = list;

    if (!options.connection) {
      yield take(actionTypes.CONNECTION_INITIALIZED);
    }
    const { connection, typesToEndpoints } = options;

    if (!['latest', 'category', 'tag', 'author'].includes(type)) {
      throw new Error(
        'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.',
      );
    }

    const perPage = yield select(dep('build', 'selectors', 'getPerPage'));
    try {
      const response = yield call(getList, {
        connection,
        type,
        id,
        page,
        perPage,
        typesToEndpoints,
      });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };

      yield put(
        actions.listSucceed({
          list,
          entities,
          result,
          total,
          endpoint: getList({ connection, type, id, page, perPage, typesToEndpoints }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.listFailed({
          list,
          error,
          endpoint: getList({ connection, type, id, page, perPage, typesToEndpoints }).toString(),
        }),
      );
    }
  };

export const entityRequested = options =>
  function* entityRequestedSaga({ entity }) {
    const { type, id } = entity;

    if (!options.connection) {
      yield take(actionTypes.CONNECTION_INITIALIZED);
    }
    const { connection, typesToEndpoints } = options;

    try {
      const response = yield call(getEntity, { connection, type, id, typesToEndpoints });
      const { entities } = normalize(response, schemas.entity);
      yield put(
        actions.entitySucceed({
          entity,
          entities,
          endpoint: getEntity({ connection, type, id, typesToEndpoints }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.entityFailed({
          entity,
          error,
          endpoint: getEntity({ connection, type, id, typesToEndpoints }).toString(),
        }),
      );
    }
  };

export const customRequested = options =>
  function* customRequestedSaga({ url, custom, params }) {
    const { type, page } = custom;

    if (!options.connection) {
      yield take(actionTypes.CONNECTION_INITIALIZED);
    }
    const { connection, typesToEndpoints } = options;

    try {
      const response = yield call(getCustom, { connection, type, page, params, typesToEndpoints });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };

      yield put(
        actions.customSucceed({
          custom,
          url,
          total,
          params,
          result,
          entities,
          endpoint: getCustom({ connection, type, page, params, typesToEndpoints }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.customFailed({
          custom,
          url,
          params,
          error,
          endpoint: getCustom({ connection, type, page, params, typesToEndpoints }).toString(),
        }),
      );
    }
  };

export const routeChangeSucceed = stores =>
  function* routeChangeSucceedSaga({ selectedItem }) {
    const { connection } = stores;
    const { type, id, page } = selectedItem;
    if (page) {
      const listPage = connection.list(type, id).page(page);

      if (listPage.ready === false && listPage.fetching === false) {
        yield put(actions.listRequested({ list: selectedItem }));
      }
    } else {
      const entity = connection.entity(type, id);

      if (entity.ready === false && entity.fetching === false) {
        yield put(actions.entityRequested({ entity: selectedItem }));
      }
    }
  };

export default function* wpApiWatchersSaga(stores) {
  const options = { connection: null };
  yield all([
    takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, routeChangeSucceed(stores)),
    takeEvery(actionTypes.ENTITY_REQUESTED, entityRequested(options)),
    takeEvery(actionTypes.LIST_REQUESTED, listRequested(options)),
    takeEvery(actionTypes.CUSTOM_REQUESTED, customRequested(options)),
  ]);
  yield call(initConnection, options);
  yield put(actions.connectionInitialized());
}
