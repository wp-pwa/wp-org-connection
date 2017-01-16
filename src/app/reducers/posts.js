import { combineReducers } from 'redux';
import { normalize } from 'normalizr';
import * as schemas from '../schemas';
import * as types from '../types';

export const entities = (state = {}, { type, posts }) => {
  if (type === types.REFRESH_POSTS_SUCCEED) {
    return normalize(posts, schemas.posts).entities;
  }
  return state;
};

export const result = (state = [], { type, posts }) => {
  if (type === types.REFRESH_POSTS_SUCCEED) {
    return normalize(posts, schemas.posts).result;
  }
  return state;
};

export const isReady = (state = false, { type }) => {
  switch (type) {
    case types.REFRESH_POSTS_REQUESTED:
      return false;
    case types.REFRESH_POSTS_SUCCEED:
      return true;
    default:
      return state;
  }
};

export const params = (state = {}, action) => {
  if (action.type === types.REFRESH_POSTS_REQUESTED) {
    return action.params || {};
  }
  return state;
};

export default combineReducers({ entities, result, isReady, params })
