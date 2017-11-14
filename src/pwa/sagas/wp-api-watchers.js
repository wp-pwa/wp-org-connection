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
  const cors = yield call(dep('router', 'sagaHelpers', 'isCors'));
  const getSetting = dep('settings', 'selectorCreators', 'getSetting');
  const url = yield select(getSetting('generalSite', 'url'));
  return new Wpapi({ endpoint: `${cors ? CorsAnywhere : ''}${url}?rest_route=` });
}

const getList = ({ connection, listType, listId, singleType, page }) => {
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

const getSingle = ({ connection, singleType, singleId }) =>
  connection[wpTypesSingularToPlural[singleType]]()
    .id(singleId)
    .embed();

export const listRequested = connection =>
  function* listRequestedSaga({ listType, listId, page }) {
    const singleType = 'post';
    if (!['category', 'tag', 'author'].includes(listType))
      throw new Error(
        'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.'
      );
    try {
      const response = yield call(getList, { connection, listType, listId, singleType, page });
      const normalized = normalize(response, schemas[singleType]);
      const entities = response._paging ? response._paging.total : 0;
      const pages = response._paging ? response._paging.totalPages : 0;
      const total = { entities, pages };
      yield put(
        actions.listSucceed({
          ...normalized,
          listType,
          listId,
          page,
          total,
        })
      );
    } catch (error) {
      yield put(
        actions.listFailed({
          listType,
          listId,
          error,
          endpoint: getList({ connection, listType, listId, singleType, page }).toString(),
        })
      );
    }
  };

export const singleRequested = connection =>
  function* singleRequestedSaga({ singleType, singleId }) {
    try {
      const response = yield call(getSingle, { connection, singleType, singleId });
      const { entities: entity } = normalize(response, schemas[singleType]);
      yield put(actions.singleSucceed({ entity }));
    } catch (error) {
      yield put(
        actions.singleFailed({
          singleType,
          singleId,
          error,
          endpoint: getSingle({ connection, singleType, singleId }).toString(),
        })
      );
    }
  };

export default function* wpApiWatchersSaga() {
  const connection = yield call(initConnection);
  yield all([
    takeEvery(actionTypes.SINGLE_REQUESTED, singleRequested(connection)),
    takeEvery(actionTypes.LIST_REQUESTED, listRequested(connection)),
  ]);
}
