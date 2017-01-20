import { combineReducers } from 'redux';
import { flow, keyBy, mapValues } from 'lodash/fp';
import * as types from '../types';

const wpTypes = [
  'posts',
  'pages',
  'categories',
  'tags',
  'users',
  'media',
  'comments',
  'taxonomies',
  'postTypes',
  'postStatuses',
];

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

const entities = combineReducers(
  flow(keyBy(key => key), mapValues(key => getEntities(key)))(wpTypes),
);

const params = combineReducers(flow(keyBy(key => key), mapValues(key => getParams(key)))(wpTypes));

export default () => combineReducers({ entities, params })
