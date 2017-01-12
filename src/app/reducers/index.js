import { combineReducers } from 'redux';
import { normalize, schema } from 'normalizr';
import * as types from '../types';

export const posts = (state = [], action) => {
  if (action.type === types.REFRESH_POSTS_SUCCEED) {
    normalize;
    schema;
    debugger;
    return action.posts;
  }
  return state;
};

export default () => combineReducers({
  posts,
});
