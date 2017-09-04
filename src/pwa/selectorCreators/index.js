import { flow, mapValues, mapKeys, uniq, flatten } from 'lodash/fp';
import { capitalize, memoize } from 'lodash';
import { wpTypesSingularToPlural } from '../constants';

const mapValuesWithKey = mapValues.convert({ cap: false });

const getParams = type => state => state.connection.params[type];

const getById = flow(
  mapValues(value => id => state => state.connection.entities[value][id]),
  mapKeys(key => `get${capitalize(key)}ById`)
)(wpTypesSingularToPlural);

const getWpTypeById = (wpType, id) => state =>
  state.connection.entities[wpType] && state.connection.entities[wpType][id];

const getListKey = name => state =>
  state.connection.names[name] && state.connection.names[name].key;
const getListWpType = name => state =>
  state.connection.names[name] && state.connection.names[name].wpType;
const getResults = (key, wpType) => state =>
  (state.connection.results[wpType] && state.connection.results[wpType][key]) || [];

const listResults = memoize(flow(flatten, uniq));

const getListResults = name => state => {
  const key = getListKey(name)(state);
  const wpType = getListWpType(name)(state);
  const results = getResults(key, wpType)(state);
  return listResults(results);
};

const getListResultsByPage = (name, page) => state => {
  const key = getListKey(name)(state);
  const wpType = getListWpType(name)(state);
  const results = getResults(key, wpType)(state);
  return results[page - 1] || [];
};

const getNumberOfRetrievedPages = name => state => {
  const key = getListKey(name)(state);
  const wpType = getListWpType(name)(state);
  const results = getResults(key, wpType)(state);
  return results.length;
};

const getNumberOfTotalPages = name => state => {
  const wpType = getListWpType(name)(state);
  if (!wpType) return 0;
  const key = getListKey(name)(state);
  return parseInt(state.connection.pages[wpType][key].pages, 10);
};

const getNumberOfTotalItems = name => state => {
  const wpType = getListWpType(name)(state);
  if (!wpType) return 0;
  const key = getListKey(name)(state);
  return parseInt(state.connection.pages[wpType][key].items, 10);
};

const getListParams = name => state =>
  (state.connection.names[name] && state.connection.names[name].params) || {};

const isListInitialisated = name => state => typeof state.connection.names[name] !== 'undefined';

const isListReady = name => state => {
  const wpType = getListWpType(name)(state);
  if (!wpType) return false;
  const key = getListKey(name)(state);
  return !!state.connection.results[wpType][key];
};

const isListLoading = name => state => {
  const wpType = getListWpType(name)(state);
  if (!wpType) return false;
  return !!state.connection.loading[wpType][name];
};

const isThisReady = flow(
  mapValuesWithKey(value => id => state => !!state.connection.entities[value][id]),
  mapKeys(key => `is${capitalize(key)}Ready`)
)(wpTypesSingularToPlural);

const isWpTypeReady = (wpType, id) => state => !!state.connection.entities[wpType][id];

const entitiesByType = {
  post: 'getPostsEntities',
  page: 'getPagesEntities',
  category: 'getCategoriesEntities',
  tag: 'getTagsEntities',
  author: 'getUsersEntities',
  media: 'getAttachmentsEntities',
};

const getEntitiesByType = wpType => state =>
  state.connection.entities[entitiesByType[wpType]] || null;

module.exports = {
  getParams,
  getListResults,
  getListResultsByPage,
  getNumberOfRetrievedPages,
  getNumberOfTotalPages,
  getNumberOfTotalItems,
  getListParams,
  isListInitialisated,
  isListReady,
  isListLoading,
  getWpTypeById,
  ...getById,
  isWpTypeReady,
  ...isThisReady,
  getEntitiesByType,
};
