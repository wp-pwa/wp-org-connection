import { combineReducers } from 'redux';
import { mapValues } from 'lodash';
import * as types from '../types';

const wpTypes = {
  posts: 'posts',
  pages: 'pages',
  categories: 'categories',
  tags: 'tags',
  users: 'users',
  media: 'media',
  comments: 'comments',
  taxonomies: 'taxonomies',
  postTypes: 'postTypes',
  postStatuses: 'postStatuses',
};

export const getParams = type => (state = {}, action) => {
  if (action.type === types[`${type.toUpperCase()}_PARAMS_CHANGED`])
    return { ...state, ...action.params };
  return state;
};

export const getEntities = type => (state = {}, action) => {
  if (action.type.endsWith('_LIST_SUCCEED') && typeof action.entities[type] !== 'undefined') {
    return { ...state, ...action.entities[type] };
  }
  return state;
};

export const getResults = type => (state = {}, action) => {
  if (action.type === types[`${type.toUpperCase()}_LIST_SUCCEED`]) {
    const result = state[action.key] || [];
    result[action.page - 1] = action.result;
    return { ...state, [action.key]: result };
  }
  return state;
}

const entities = combineReducers(mapValues(wpTypes, key => getEntities(key)));

const params = combineReducers(mapValues(wpTypes, key => getParams(key)));

const results = combineReducers(mapValues(wpTypes, key => getResults(key)));

export default () => combineReducers({ entities, params, results })
