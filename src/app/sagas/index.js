import Wpapi from 'wpapi';
import { takeLatest } from 'redux-saga';
import { normalize } from 'normalizr';
import { forOwn, capitalize } from 'lodash';
import { toString } from 'query-parse';
import { call, select, put, fork } from 'redux-saga/effects';
import defaults from './defaults';
import * as actions from '../actions';
import * as types from '../types';
import * as selectorCreators from '../selectorCreators';
import * as schemas from '../schemas';
import * as deps from '../deps';
import { wpTypesPlural, wpTypesSingular, wpTypesSingularToPlural } from '../constants';

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
  return new Wpapi({ endpoint: `${url}?rest_route=` });
}

export const newListRequested = (connection, wpType) =>
  function* newListRequestedSaga({ params: newParams, name }) {
    const globalParams = yield select(selectorCreators.getParams(wpType));
    const params = { ...globalParams, ...newParams };
    try {
      const response = yield call(getList, { connection, wpType, params, page: 1 });
      const normalized = normalize(response, schemas[wpType]);
      const key = toString(params);
      yield put(
        actions[`new${capitalize(wpType)}ListSucceed`]({
          ...normalized,
          params,
          key,
          name,
          wpType,
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
      const page = reqPage || (yield select(selectorCreators.getListNumberOfPages(name))) + 1;
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
  yield Object
    .keys(wpTypesPlural)
    .map(
      key =>
        takeLatest(
          types[`NEW_${wpTypesPlural[key]}_LIST_REQUESTED`],
          newListRequested(connection, key),
        ),
    );
  yield Object
    .keys(wpTypesPlural)
    .map(
      key =>
        takeLatest(
          types[`ANOTHER_${wpTypesPlural[key]}_PAGE_REQUESTED`],
          anotherPageRequested(connection, key),
        ),
    );
  yield Object
    .keys(wpTypesSingular)
    .map(
      key =>
        takeLatest(types[`${wpTypesSingular[key]}_REQUESTED`], singleRequested(connection, key)),
    );
  yield fork(defaults);
}
