import { flow, mapValues, mapKeys } from 'lodash/fp';
import { wpTypes } from '../constants';

const paramsChanged = flow(
  mapValues(value => `connection/${value}_PARAMS_CHANGED`),
  mapKeys(key => `${wpTypes[key]}_PARAMS_CHANGED`),
)(wpTypes);

const newListRequested = flow(
  mapValues(value => `connection/NEW_${value}_LIST_REQUESTED`),
  mapKeys(key => `NEW_${wpTypes[key]}_LIST_REQUESTED`),
)(wpTypes);

const newListSucceed = flow(
  mapValues(value => `connection/NEW_${value}_LIST_SUCCEED`),
  mapKeys(key => `NEW_${wpTypes[key]}_LIST_SUCCEED`),
)(wpTypes);

const newListFailed = flow(
  mapValues(value => `connection/NEW_${value}_LIST_FAILED`),
  mapKeys(key => `NEW_${wpTypes[key]}_LIST_FAILED`),
)(wpTypes);

const anotherPageRequested = flow(
  mapValues(value => `connection/ANOTHER_${value}_PAGE_REQUESTED`),
  mapKeys(key => `ANOTHER_${wpTypes[key]}_PAGE_REQUESTED`),
)(wpTypes);

const anotherPageSucceed = flow(
  mapValues(value => `connection/ANOTHER_${value}_PAGE_SUCCEED`),
  mapKeys(key => `ANOTHER_${wpTypes[key]}_PAGE_SUCCEED`),
)(wpTypes);

const anotherPageFailed = flow(
  mapValues(value => `connection/ANOTHER_${value}_PAGE_FAILED`),
  mapKeys(key => `ANOTHER_${wpTypes[key]}_PAGE_FAILED`),
)(wpTypes);

module.exports = {
  ...paramsChanged,
  ...newListRequested,
  ...newListSucceed,
  ...newListFailed,
  ...anotherPageRequested,
  ...anotherPageSucceed,
  ...anotherPageFailed,
};
