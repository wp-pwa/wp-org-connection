import { flow, mapValues, mapKeys } from 'lodash/fp';
import { capitalize } from 'lodash';
import { wpTypesPlural } from '../constants';
import * as selectorCreators from '../selectorCreators';

const mapValuesWithKey = mapValues.convert({ cap: false });

const getParams = flow(
  mapValuesWithKey((value, key) => state => state.connection.params[key]),
  mapKeys(key => `get${capitalize(key)}Params`),
)(wpTypesPlural);

const getCurrentWpType = state =>
  state.connection.names.currentId && state.connection.names.currentId.wpType;
const getCurrentId = state =>
  state.connection.names.currentId && state.connection.names.currentId.id;

const getCurrentSingle = state => {
  const wpType = getCurrentWpType(state);
  const id = getCurrentId(state);
  return selectorCreators.getWpTypeById(wpType, id)(state);
};

const isCurrentSingleReady = state => {
  const wpType = getCurrentWpType(state);
  if (!wpType) return false;
  const id = getCurrentId(state);
  return selectorCreators.isWpTypeReady(wpType, id)(state);
};

module.exports = {
  ...getParams,
  getCurrentSingle,
  isCurrentSingleReady,
  getCurrentWpType,
  getCurrentId,
};
