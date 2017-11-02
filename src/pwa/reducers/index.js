import { combineReducers } from 'redux';
import { mapValues } from 'lodash';
import * as types from '../types';
import { wpTypesPlural, wpTypesSingular } from '../constants';
import router from './router';

export const paramsReducer = value => (state = {}, action) => {
  if (action.type === types[`${value}_PARAMS_CHANGED`]) {
    return { ...state, ...action.params };
  }
  return state;
};

const isNewListSucceed = type =>
  Object.values(wpTypesPlural)
    .map(item => `connection/NEW_${item}_LIST_SUCCEED`)
    .indexOf(type) !== -1;

const isAnotherPageSucceed = type =>
  Object.values(wpTypesPlural)
    .map(item => `connection/ANOTHER_${item}_PAGE_SUCCEED`)
    .indexOf(type) !== -1;

const isSingleSucceed = type =>
  Object.values(wpTypesSingular)
    .map(item => `connection/${item}_SUCCEED`)
    .indexOf(type) !== -1;

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
    const result = state[action.key] ? [...state[action.key]] : [];
    const page = action.page || 1;
    result[page - 1] = action.result;
    return { ...state, [action.key]: result };
  }
  return state;
};

export const pagesReducer = value => (state = {}, action) => {
  if (action.type === types[`NEW_${value}_LIST_SUCCEED`]) {
    return {
      ...state,
      [action.key]: { items: action.items, pages: action.pages },
    };
  }
  return state;
};

export const names = (state = {}, { type, wpType, name, key, params, id }) => {
  if (type === types.NAME_KEY_CHANGED) {
    if (name === 'currentSingle') return { ...state, currentSingle: { wpType, id } };
    return { ...state, [name]: { wpType, key, params } };
  }
  return state;
};

export const loadingReducer = value => (state = {}, { type, name }) => {
  switch (type) {
    case types[`NEW_${value}_LIST_REQUESTED`]:
    case types[`ANOTHER_${value}_PAGE_REQUESTED`]:
      return { ...state, [name]: true };
    case types[`NEW_${value}_LIST_SUCCEED`]:
    case types[`NEW_${value}_LIST_FAILED`]:
    case types[`ANOTHER_${value}_PAGE_SUCCEED`]:
    case types[`ANOTHER_${value}_PAGE_FAILED`]:
      return { ...state, [name]: false };
    default:
      return state;
  }
};

export const siteInfo = (state = null, action) => {
  switch (action.type) {
    case types.SITE_INFO_SUCCEED:
      return {
        title: action.title,
        description: action.metadesc,
      };
    default:
      return state;
  }
};

const entities = combineReducers(mapValues(wpTypesPlural, entitiesReducer));
const params = combineReducers(mapValues(wpTypesPlural, paramsReducer));
const results = combineReducers(mapValues(wpTypesPlural, resultsReducer));
const pages = combineReducers(mapValues(wpTypesPlural, pagesReducer));
const loading = combineReducers(mapValues(wpTypesPlural, loadingReducer));

export default combineReducers({
  siteInfo,
  entities,
  params,
  results,
  names,
  pages,
  loading,
  router,
});
