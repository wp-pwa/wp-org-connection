import { flow, mapValues, mapKeys } from 'lodash/fp';
import { flatten, capitalize } from 'lodash';
import { wpTypesSingular } from '../constants';

const mapValuesWithKey = mapValues.convert({ cap: false });

const getParams = type => state => state.connection.params[type];

const getById = flow(
  mapValuesWithKey((value, key) => id => state => state.connection.entities[key][id]),
  mapKeys(key => `get${capitalize(key)}ById`),
)(wpTypesSingular);

const getListKey = name =>
  state => state.connection.names[name] && state.connection.names[name].key;
const getListWpType = name =>
  state => state.connection.names[name] && state.connection.names[name].wpType;
const getResults = (key, wpType) =>
  state => state.connection.results[wpType] && state.connection.results[wpType][key] || [];

const getListResults = name => state => {
  const key = getListKey(name)(state);
  const wpType = getListWpType(name)(state);
  const results = getResults(key, wpType)(state);
  return flatten(results);
};

const getListResultsByPage = (name, page) => state => {
  const key = getListKey(name)(state);
  const wpType = getListWpType(name)(state);
  const results = getResults(key, wpType)(state);
  return results[page - 1] || [];
};

const getNumberOfPages = name => state => {
  const key = getListKey(name)(state);
  const wpType = getListWpType(name)(state);
  const results = getResults(key, wpType)(state);
  return results.length;
};

const getListParams = name =>
  state => state.connection.names[name] && state.connection.names[name].params || {};

const isListInitialisated = name => state => typeof state.connection.names[name] !== 'undefined';

const isListReady = name => state => {
  const wpType = getListWpType(name)(state);
  if (!wpType) return false;
  const result = getListResults(name)(state);
  return result.reduce((prev, id) => prev && !!getById[wpType](id)(state), true);
};

module.exports = {
  getParams,
  getListResults,
  getListResultsByPage,
  getNumberOfPages,
  getListParams,
  isListInitialisated,
  isListReady,
  ...getById,
};
