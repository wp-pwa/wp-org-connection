import { flow, mapValues, mapKeys } from 'lodash/fp';
import { wpTypesPlural } from '../constants';

const paramsChanged = flow(
  mapValues(value => `connection/${value}_PARAMS_CHANGED`),
  mapKeys(key => `${wpTypesPlural[key]}_PARAMS_CHANGED`),
)(wpTypesPlural);

const newListRequested = flow(
  mapValues(value => `connection/NEW_${value}_LIST_REQUESTED`),
  mapKeys(key => `NEW_${wpTypesPlural[key]}_LIST_REQUESTED`),
)(wpTypesPlural);

const newListSucceed = flow(
  mapValues(value => `connection/NEW_${value}_LIST_SUCCEED`),
  mapKeys(key => `NEW_${wpTypesPlural[key]}_LIST_SUCCEED`),
)(wpTypesPlural);

const newListFailed = flow(
  mapValues(value => `connection/NEW_${value}_LIST_FAILED`),
  mapKeys(key => `NEW_${wpTypesPlural[key]}_LIST_FAILED`),
)(wpTypesPlural);

const anotherPageRequested = flow(
  mapValues(value => `connection/ANOTHER_${value}_PAGE_REQUESTED`),
  mapKeys(key => `ANOTHER_${wpTypesPlural[key]}_PAGE_REQUESTED`),
)(wpTypesPlural);

const anotherPageSucceed = flow(
  mapValues(value => `connection/ANOTHER_${value}_PAGE_SUCCEED`),
  mapKeys(key => `ANOTHER_${wpTypesPlural[key]}_PAGE_SUCCEED`),
)(wpTypesPlural);

const anotherPageFailed = flow(
  mapValues(value => `connection/ANOTHER_${value}_PAGE_FAILED`),
  mapKeys(key => `ANOTHER_${wpTypesPlural[key]}_PAGE_FAILED`),
)(wpTypesPlural);

module.exports = {
  ...paramsChanged,
  ...newListRequested,
  ...newListSucceed,
  ...newListFailed,
  ...anotherPageRequested,
  ...anotherPageSucceed,
  ...anotherPageFailed,
};
