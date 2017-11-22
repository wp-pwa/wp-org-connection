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
  return new Wpapi({ endpoint: `${cors ? CorsAnywhere : ''}${url}?rest_route=` });
}

export const getList = ({ connection, listType, listId, singleType, page }) => {
  const endpoint = typesToEndpoints[singleType];
  const paramType = ['category', 'tag', 'author'].includes(listType)
    ? typesToParams[listType]
    : listType;
  const params = { _embed: true, [paramType]: listId };
  let query = connection[endpoint]().page(page);
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};

export const getSingle = ({ connection, singleType, singleId }) =>
  connection[typesToEndpoints[singleType]]()
    .id(singleId)
    .embed();

export const getCustom = ({ connection, singleType, page, params }) => {
  let query = connection[typesToEndpoints[singleType]]().page(page);
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query.embed();
};

export const listRequested = connection =>
  function* listRequestedSaga({ listType, listId = null, page = 1 }) {
    const singleType = 'post';
    if (!['latest', 'category', 'tag', 'author'].includes(listType))
      throw new Error(
        'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.',
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
        }),
      );
    } catch (error) {
      yield put(
        actions.listFailed({
          listType,
          listId,
          error,
          endpoint: getList({ connection, listType, listId, singleType, page }).toString(),
        }),
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
          endpoint: getSingle({ connection, singleType, singleId }).toString(),
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
          result: result.map(item => item.id),
          entities,
        }),
      );
    } catch (error) {
      yield put(
        actions.customFailed({
          url,
          name,
          singleType,
          page,
          error,
          endpoint: getCustom({ connection, singleType, params }).toString(),
        }),
      );
    }
  };

export default function* wpApiWatchersSaga() {
  const connection = yield call(initConnection);
  yield all([
    takeEvery(actionTypes.SINGLE_REQUESTED, singleRequested(connection)),
    takeEvery(actionTypes.LIST_REQUESTED, listRequested(connection)),
    takeEvery(actionTypes.CUSTOM_REQUESTED, customRequested(connection)),
  ]);
}
