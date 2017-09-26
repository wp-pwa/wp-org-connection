import { createSelector } from 'reselect';
import { dep } from 'worona-deps';
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
  state.connection.names.currentSingle && state.connection.names.currentSingle.wpType;
const getCurrentId = state =>
  state.connection.names.currentSingle && state.connection.names.currentSingle.id;

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

const getEntities = flow(
  mapValuesWithKey((value, key) => state => state.connection.entities[key]),
  mapKeys(key => `get${capitalize(key)}Entities`),
)(wpTypesPlural);

const getEntity = createSelector(
  state => state,
  dep('router', 'selectors', 'getId'),
  dep('router', 'selectors', 'getType'),
  (state, id, type) => {
    if (type === 'latest') return null;

    const selectorName = `get${type
      .slice(0, 1)
      .toUpperCase()
      .concat(type.slice(1))}ById`;

    return dep('connection', 'selectorCreators', selectorName)(id)(state);
  },
);

const getTitle = createSelector(
  state => state,
  getEntity,
  (state, entity) =>
    (entity && entity.yoast_meta && entity.yoast_meta.yoast_wpseo_title) ||
    (entity && entity.title && entity.title.rendered) ||
    (entity && entity.name) ||
    (state.connection.siteInfo && state.connection.siteInfo.title) ||
    '',
);

const getDescription = createSelector(
  state => state,
  getEntity,
  (state, entity) =>
    (entity && entity.yoast_meta && entity.yoast_meta.yoast_wpseo_metadesc) ||
    (entity && entity.description) ||
    (state.connection.siteInfo && state.connection.siteInfo.description) ||
    '',
);

const getCanonical = createSelector(
  getEntity,
  entity =>
    (entity && entity.yoast_meta && entity.yoast_meta.yoast_wpseo_canonical) ||
    (entity && entity.link) ||
    '',
);

module.exports = {
  ...getParams,
  ...getEntities,
  getCurrentSingle,
  isCurrentSingleReady,
  getCurrentWpType,
  getCurrentId,
  getEntity,
  getTitle,
  getDescription,
  getCanonical,
};
