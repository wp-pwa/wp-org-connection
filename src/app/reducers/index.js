import { combineReducers } from 'redux';
import { mapValues } from 'lodash';
import * as types from '../types';
import { wpTypesPlural, wpTypesSingular } from '../constants';

export const paramsReducer = value => (state = {}, action) => {
  if (action.type === types[`${value}_PARAMS_CHANGED`]) {
    return { ...state, ...action.params };
  }
  return state;
};

const isNewListSucceed = type =>
  Object.values(wpTypesPlural).map(item => `connection/NEW_${item}_LIST_SUCCEED`).indexOf(type) !==
    -1;

const isAnotherPageSucceed = type =>
  Object
    .values(wpTypesPlural)
    .map(item => `connection/ANOTHER_${item}_PAGE_SUCCEED`)
    .indexOf(type) !==
    -1;

const isSingleSucceed = type =>
  Object.values(wpTypesSingular).map(item => `connection/${item}_SUCCEED`).indexOf(type) !== -1;

export const entitiesReducer = (value, key) => (state = {}, action) => {
  if (
    (isNewListSucceed(action.type) ||
      isAnotherPageSucceed(action.type) ||
      isSingleSucceed(action.type)) &&
      typeof action.entities[key] !== 'undefined'
  ) {
    return { ...state, ...action.entities[key] };
  }
  return state;
};

export const resultsReducer = value => (state = {}, action) => {
  if (
    action.type === types[`NEW_${value}_LIST_SUCCEED`] ||
      action.type === types[`ANOTHER_${value}_PAGE_SUCCEED`]
  ) {
    const result = state[action.key] || [];
    const page = action.page || 1;
    result[page - 1] = action.result;
    return { ...state, [action.key]: result };
  }
  return state;
};

export const names = (state = {}, { type, wpType, name, key, params }) => {
  if (isNewListSucceed(type)) {
    return { ...state, [name]: { wpType, key, params } };
  }
  return state;
};

const entities = combineReducers(mapValues(wpTypesPlural, entitiesReducer));
const params = combineReducers(mapValues(wpTypesPlural, paramsReducer));
const results = combineReducers(mapValues(wpTypesPlural, resultsReducer));

export default () => combineReducers({ entities, params, results, names });
