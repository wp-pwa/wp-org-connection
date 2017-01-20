import { combineReducers } from 'redux';
import { mapValues } from 'lodash';
import * as types from '../types';

const wpTypes = {
  posts: 'POSTS',
  pages: 'PAGES',
  categories: 'CATEGORIES',
  tags: 'TAGS',
  users: 'USERS',
  media: 'MEDIA',
  comments: 'COMMENTS',
  taxonomies: 'TAXONOMIES',
  postTypes: 'POST_TYPES',
  postStatuses: 'POST_STATUSES',
};

export const getParams = type => (state = {}, action) => {
  if (action.type === types[`${wpTypes[type]}_PARAMS_CHANGED`])
    return { ...state, ...action.params };
  return state;
};

export const getEntities = type => (state = {}, action) => {
  if (
    action.type.startsWith('connection/') && action.type.endsWith('_LIST_SUCCEED') &&
      typeof action.entities[type] !== 'undefined'
  ) {
    return { ...state, ...action.entities[type] };
  }
  return state;
};

export const getResults = type => (state = {}, action) => {
  if (action.type === types[`${wpTypes[type]}_LIST_SUCCEED`]) {
    const result = state[action.key] || [];
    result[action.page - 1] = action.result;
    return { ...state, [action.key]: result };
  }
  return state;
};

export const names = (state = {}, { type, wpType, name, key }) => {
  if (type.startsWith('connection/') && type.endsWith('_LIST_SUCCEED')) {
    return { ...state, [name]: { wpType, key } };
  }
  return state;
};

const entities = combineReducers(mapValues(wpTypes, key => getEntities(key)));
const params = combineReducers(mapValues(wpTypes, key => getParams(key)));
const results = combineReducers(mapValues(wpTypes, key => getResults(key)));

export default () => combineReducers({ entities, params, results, names })
