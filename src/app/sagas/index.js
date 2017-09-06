/* eslint-disable no-underscore-dangle, no-undef */
import Wpapi from 'wpapi';
import { takeEvery } from 'redux-saga';
import { normalize } from 'normalizr';
import { forOwn, capitalize } from 'lodash';
import { toString } from '@worona/query-parse';
import { call, select, put, fork } from 'redux-saga/effects';
import defaults from './defaults';
import deepUrls from './deepUrls';
import * as actions from '../actions';
import * as types from '../types';
import * as selectorCreators from '../selectorCreators';
import * as schemas from '../schemas';
import * as deps from '../deps';
import { wpTypesPlural, wpTypesSingular, wpTypesSingularToPlural } from '../constants';

const CorsAnywhere = 'https://cors.worona.io/';

const getList = ({ connection, wpType, params, page }) => {
  let query = connection[wpType]().page(page);
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};

const getSingle = ({ connection, wpType, id }) =>
  connection[wpTypesSingularToPlural[wpType]]().id(id).embed();

export function* initConnection() {
  const url = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  const preview = yield select(deps.selectors.getPreview);
  return new Wpapi({
    endpoint: `${preview || window.location.protocol === 'https:' ? CorsAnywhere : ''}${url}?rest_route=`,
  });
}

export const newListRequested = (connection, wpType) =>
  function* newListRequestedSaga({ params: newParams, name }) {
    const globalParams = yield select(selectorCreators.getParams(wpType));
    const params = { ...globalParams, ...newParams };
    const key = toString(params);
    yield put(actions.nameKeyChanged({ name, key, params, wpType }));
    try {
      const response = yield call(getList, { connection, wpType, params, page: 1 });
      const normalized = normalize(response, schemas[wpType]);
      response._paging = response._paging || { total: 0, totalPages: 0 };
      yield put(
        actions[`new${capitalize(wpType)}ListSucceed`]({
          ...normalized,
          params,
          key,
          name,
          wpType,
          items: response._paging.total,
          pages: response._paging.totalPages,
        }),
      );
    } catch (error) {
      yield put(
        actions[`new${capitalize(wpType)}ListFailed`]({
          error,
          params,
          name,
          endpoint: getList({ connection, wpType, params, page: 1 }).toString(),
        }),
      );
    }
  };

export const anotherPageRequested = (connection, wpType) =>
  function* anotherPageRequestedSage({ page: reqPage, name }) {
    const params = yield select(selectorCreators.getListParams(name));
    try {
      const isListInitialisated = yield select(selectorCreators.isListInitialisated(name));
      if (!isListInitialisated) throw new Error(`List ${name} is not initialised yet.`);
      const page = reqPage || (yield select(selectorCreators.getNumberOfRetrievedPages(name))) + 1;
      const response = yield call(getList, { connection, wpType, params, page });
      const normalized = normalize(response, schemas[wpType]);
      const key = toString(params);
      yield put(
        actions[`another${capitalize(wpType)}PageSucceed`]({
          ...normalized,
          params,
          key,
          page,
          name,
          wpType,
        }),
      );
    } catch (error) {
      yield put(
        actions[`another${capitalize(wpType)}PageFailed`]({
          error,
          params,
          name,
          endpoint: getList({ connection, wpType, params, page: 1 }).toString(),
        }),
      );
    }
  };

export const singleRequested = (connection, wpType) =>
  function* singleRequestedSaga({ id, current }) {
    if (current)
      yield put(
        actions.nameKeyChanged({
          name: 'currentSingle',
          wpType: wpTypesSingularToPlural[wpType],
          id,
        }),
      );
    try {
      const response = yield call(getSingle, { connection, wpType, id });
      const { entities } = normalize(response, schemas[wpType]);
      yield put(
        actions[`${wpType}Succeed`]({
          entities,
          id,
          wpType: wpTypesSingularToPlural[wpType],
          current,
        }),
      );
    } catch (error) {
      yield put(
        actions[`${wpType}Failed`]({
          error,
          id,
          current,
          wpType: wpTypesSingularToPlural[wpType],
          endpoint: getSingle({ connection, wpType, id }).toString(),
        }),
      );
    }
  };

export default function* wpOrgConnectionSagas() {
  const connection = yield call(initConnection);
  yield put(actions.postsParamsChanged({ params: { _embed: true } }));
  yield Object.keys(wpTypesPlural).map(key =>
    takeEvery(
      types[`NEW_${wpTypesPlural[key]}_LIST_REQUESTED`],
      newListRequested(connection, key),
    ));
  yield Object.keys(wpTypesPlural).map(key =>
    takeEvery(
      types[`ANOTHER_${wpTypesPlural[key]}_PAGE_REQUESTED`],
      anotherPageRequested(connection, key),
    ));
  yield Object.keys(wpTypesSingular).map(key =>
    takeEvery(types[`${wpTypesSingular[key]}_REQUESTED`], singleRequested(connection, key)));
  yield fork(defaults);
  yield fork(deepUrls, connection);
}
