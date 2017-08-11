import { flow, mapValues, mapKeys } from 'lodash/fp';
import { wpTypesPlural, wpTypesSingular } from '../constants';

const paramsChanged = flow(
  mapValues(value => `connection/${value}_PARAMS_CHANGED`),
  mapKeys(key => `${wpTypesPlural[key]}_PARAMS_CHANGED`),
)(wpTypesPlural);

const newListRequested = flow(
  mapValues(value => `connection/NEW_${value}_LIST_REQUESTED`),
  mapKeys(key => `NEW_${wpTypesPlural[key]}_LIST_REQUESTED`),
)(wpTypesPlural);

const NAME_KEY_CHANGED = 'connection/NAME_KEY_CHANGED';

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

const singleRequested = flow(
  mapValues(value => `connection/${value}_REQUESTED`),
  mapKeys(key => `${wpTypesSingular[key]}_REQUESTED`),
)(wpTypesSingular);

const singleSucceed = flow(
  mapValues(value => `connection/${value}_SUCCEED`),
  mapKeys(key => `${wpTypesSingular[key]}_SUCCEED`),
)(wpTypesSingular);

const singleFailed = flow(
  mapValues(value => `connection/${value}_FAILED`),
  mapKeys(key => `${wpTypesSingular[key]}_FAILED`),
)(wpTypesSingular);

const DISCOVER_URL_REQUESTED = 'connection/DISCOVER_URL_REQUESTED';
const DISCOVER_URL_SUCCEED = 'connection/DISCOVER_URL_SUCCEED';
const DISCOVER_URL_FAILED = 'connection/DISCOVER_URL_FAILED';

module.exports = {
  ...paramsChanged,
  ...newListRequested,
  NAME_KEY_CHANGED,
  ...newListSucceed,
  ...newListFailed,
  ...anotherPageRequested,
  ...anotherPageSucceed,
  ...anotherPageFailed,
  ...singleRequested,
  ...singleSucceed,
  ...singleFailed,
  DISCOVER_URL_REQUESTED,
  DISCOVER_URL_SUCCEED,
  DISCOVER_URL_FAILED,
};
