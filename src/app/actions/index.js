import { capitalize } from 'lodash';
import { flow, mapValues, mapKeys } from 'lodash/fp';
import * as types from '../types';
import { wpTypes } from '../constants';

const paramsChange = flow(
  mapValues(value =>
    ({ params = {} } = {}) => ({ type: types[`${value}_PARAMS_CHANGED`], params })),
  mapKeys(key => `${key}ParamsChanged`),
)(wpTypes);

const newListRequested = flow(
  mapValues(value =>
    ({ params = {}, name = 'currentList' } = {}) => ({
      type: types[`NEW_${value}_LIST_REQUESTED`],
      params,
      name,
    })),
  mapKeys(key => `new${capitalize(key)}ListRequested`),
)(wpTypes);

const newListSucceed = flow(
  mapValues(value =>
    ({ params, entities, result, key, wpType, name }) => ({
      type: types[`NEW_${value}_LIST_SUCCEED`],
      params,
      entities,
      result,
      key,
      wpType,
      name,
    })),
  mapKeys(key => `new${capitalize(key)}ListSucceed`),
)(wpTypes);

const newListFailed = flow(
  mapValues(value =>
    ({ params, error, endpoint, name }) => ({
      type: types[`NEW_${value}_LIST_FAILED`],
      params,
      error,
      endpoint,
      name,
    })),
  mapKeys(key => `new${capitalize(key)}ListFailed`),
)(wpTypes);

const anotherPageRequested = flow(
  mapValues(value =>
    ({ name = 'currentList', page } = {}) => ({
      type: types[`ANOTHER_${value}_PAGE_REQUESTED`],
      page,
      name,
    })),
  mapKeys(key => `another${capitalize(key)}PageRequested`),
)(wpTypes);

const anotherPageSucceed = flow(
  mapValues(value =>
    ({ params, entities, result, key, wpType, name, page }) => ({
      type: types[`ANOTHER_${value}_PAGE_SUCCEED`],
      params,
      entities,
      result,
      key,
      wpType,
      name,
      page,
    })),
  mapKeys(key => `another${capitalize(key)}PageSucceed`),
)(wpTypes);

const anotherPageFailed = flow(
  mapValues(value =>
    ({ params, error, endpoint, name, page }) => ({
      type: types[`ANOTHER_${value}_PAGE_FAILED`],
      params,
      error,
      endpoint,
      name,
      page,
    })),
  mapKeys(key => `another${capitalize(key)}PageFailed`),
)(wpTypes);

module.exports = {
  ...paramsChange,
  ...newListRequested,
  ...newListSucceed,
  ...newListFailed,
  ...anotherPageRequested,
  ...anotherPageSucceed,
  ...anotherPageFailed,
};
