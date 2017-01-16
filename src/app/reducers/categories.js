import { combineReducers } from 'redux';
import { normalize } from 'normalizr';
import * as schemas from '../schemas';
import * as types from '../types';

export const entities = (state = {}, { type, categories }) => {
  if (type === types.REFRESH_CATEGORIES_SUCCEED) {
    return normalize(categories, schemas.categories).entities;
  }
  return state;
};

export const result = (state = [], { type, categories }) => {
  if (type === types.REFRESH_CATEGORIES_SUCCEED) {
    return normalize(categories, schemas.categories).result;
  }
  return state;
};

export const isReady = (state = false, { type }) => {
  switch (type) {
    case types.REFRESH_CATEGORIES_REQUESTED:
      return false;
    case types.REFRESH_CATEGORIES_SUCCEED:
      return true;
    default:
      return state;
  }
};

export default combineReducers({ entities, result, isReady })
