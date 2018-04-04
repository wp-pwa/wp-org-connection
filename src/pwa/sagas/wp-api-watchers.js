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

export const getEntity = ({ connection, type, id }) =>
  connection[typesToEndpoints(type)]()
    .id(id)
    .embed();

export const getCustom = ({ connection, type, page, params }) => {
  let query = connection[typesToEndpoints(type)]()
    .page(page)
    .embed();

  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });

  return query;
};

export const listRequested = connection =>
  function* listRequestedSaga({ list }) {
    const { type, id, page } = list;

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
          list,
          entities,
          result,
          total,
          endpoint: getList({ connection, type, id, page }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.listFailed({
          list,
          error,
          endpoint: getList({ connection, type, id, page }).toString(),
        }),
      );
    }
  };

export const entityRequested = connection =>
  function* entityRequestedSaga({ entity }) {
    const { type, id } = entity;

    try {
      const response = yield call(getEntity, { connection, type, id });
      const { entities } = normalize(response, schemas.entity);
      yield put(
        actions.entitySucceed({
          entity,
          entities,
          endpoint: getEntity({ connection, type, id }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.entityFailed({
          entity,
          error,
          endpoint: getEntity({ connection, type, id }).toString(),
        }),
      );
    }
  };

export const customRequested = connection =>
  function* customRequestedSaga({ url, custom, params }) {
    const { type, page } = custom;

    try {
      const response = yield call(getCustom, { connection, type, page, params });
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
          endpoint: getCustom({ connection, type, page, params }).toString(),
        }),
      );
    } catch (error) {
      yield put(
        actions.customFailed({
          custom,
          url,
          params,
          error,
          endpoint: getCustom({ connection, type, page, params }).toString(),
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
