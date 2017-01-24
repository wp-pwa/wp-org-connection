import { combineReducers } from 'redux';
import { mapValues } from 'lodash';
import * as types from '../types';
import { wpTypesPlural } from '../constants';

export const paramsReducer = value => (state = {}, action) => {
  if (action.type === types[`${value}_PARAMS_CHANGED`]) {
    return { ...state, ...action.params };
  }
  return state;
};

export const entitiesReducer = (value, key) => (state = {}, action) => {
  if (
    (action.type.startsWith('connection/NEW_') && action.type.endsWith('_LIST_SUCCEED') ||
      action.type.startsWith('connection/ANOTHER_') && action.type.endsWith('_PAGE_SUCCEED')) &&
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
  if (type.startsWith('connection/NEW_') && type.endsWith('_LIST_SUCCEED')) {
    return { ...state, [name]: { wpType, key, params } };
  }
  return state;
};

const entities = combineReducers(mapValues(wpTypesPlural, entitiesReducer));
const params = combineReducers(mapValues(wpTypesPlural, paramsReducer));
const results = combineReducers(mapValues(wpTypesPlural, resultsReducer));

export default () => combineReducers({ entities, params, results, names });
