import { combineReducers } from 'redux';
import { normalize } from 'normalizr';
import * as schemas from '../schemas';
import * as types from '../types';

export const posts = (state = [], action) => {
  if (action.type === types.REFRESH_POSTS_SUCCEED) {
    return normalize(action.posts, schemas.posts);
  }
  return state;
};

export default () => combineReducers({
  posts,
});
