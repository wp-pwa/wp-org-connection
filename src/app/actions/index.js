import { capitalize } from 'lodash';
import { flow, mapValues, mapKeys } from 'lodash/fp';
import * as types from '../types';
import { wpTypesPlural, wpTypesSingular } from '../constants';

const paramsChange = flow(
  mapValues(value =>
    ({ params = {} } = {}) => ({ type: types[`${value}_PARAMS_CHANGED`], params })),
  mapKeys(key => `${key}ParamsChanged`),
)(wpTypesPlural);

const newListRequested = flow(
  mapValues(value =>
    ({ params = {}, name = 'currentList' } = {}) => ({
      type: types[`NEW_${value}_LIST_REQUESTED`],
      params,
      name,
    })),
  mapKeys(key => `new${capitalize(key)}ListRequested`),
)(wpTypesPlural);

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
)(wpTypesPlural);

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
)(wpTypesPlural);

const anotherPageRequested = flow(
  mapValues(value =>
    ({ name = 'currentList', page } = {}) => ({
      type: types[`ANOTHER_${value}_PAGE_REQUESTED`],
      page,
      name,
    })),
  mapKeys(key => `another${capitalize(key)}PageRequested`),
)(wpTypesPlural);

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
)(wpTypesPlural);

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
)(wpTypesPlural);

const singleRequested = flow(
  mapValues(value =>
    ({ id, current = false }) => ({ type: types[`${value}_REQUESTED`], id, current })),
  mapKeys(key => `${key}Requested`),
)(wpTypesSingular);

const singleSucceed = flow(
  mapValues(value =>
    ({ id, entities, current, wpType }) => ({
      type: types[`${value}_SUCCEED`],
      id,
      entities,
      current,
      wpType,
    })),
  mapKeys(key => `${key}Succeed`),
)(wpTypesSingular);

const singleFailed = flow(
  mapValues(value =>
    ({ id, error, endpoint, current, wpType }) => ({
      type: types[`${value}_FAILED`],
      id,
      error,
      endpoint,
      wpType,
      current,
    })),
  mapKeys(key => `${key}Failed`),
)(wpTypesSingular);

module.exports = {
  ...paramsChange,
  ...newListRequested,
  ...newListSucceed,
  ...newListFailed,
  ...anotherPageRequested,
  ...anotherPageSucceed,
  ...anotherPageFailed,
  ...singleRequested,
  ...singleSucceed,
  ...singleFailed,
};
