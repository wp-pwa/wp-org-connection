import { types } from 'mobx-state-tree';
import { Any } from './single';
import { List } from './list';
import { Custom } from './custom';
import SiteInfo from './site-info';
import * as actionTypes from '../../actionTypes';
import convert from '../../converters';

export const props = {
  singleMap: types.optional(types.map(types.map(Any)), {}),
  listMap: types.optional(types.map(types.map(List)), {}),
  customMap: types.optional(types.map(Custom), {}),
  siteInfo: types.optional(SiteInfo, {}),
};

export const views = self => {
  const single = {};
  const list = {};
  const custom = {};
  return {
    get single() {
      self.singleMap.keys().forEach(type => {
        single[type] = single[type] || [];
        self.singleMap
          .get(type)
          .keys()
          .forEach(index => {
            if (!single[type][index]) single[type][index] = self.singleMap.get(type).get(index);
          });
      });
      return single;
    },
    get list() {
      self.listMap.keys().forEach(type => {
        list[type] = list[type] || {};
        self.listMap
          .get(type)
          .keys()
          .forEach(index => {
            if (!list[type][index]) list[type][index] = self.listMap.get(type).get(index);
          });
      });
      return list;
    },
    get custom() {
      self.customMap.keys().forEach(name => {
        if (!custom[name]) custom[name] = self.customMap.get(name);
      });
      return custom;
    },
  };
};

const addEntity = ({ self, type, id, entity, ready = false, fetching = false }) => {
  const singleType =
    type === 'post' ? (entity && entity.type) || type : (entity && entity.taxonomy) || type;
  // Init the first map (type) if it's not initializated yet.
  if (!self.singleMap.get(singleType)) self.singleMap.set(singleType, {});
  // Create entity if it's not set and convert it if it's set.
  const newEntity = entity ? convert(entity) : { id, type: singleType };
  // Populate the state with the entity value and set both fetching and ready.
  self.singleMap.get(singleType).set(id, { ...newEntity, fetching, ready });
};

const addEntities = ({ self, entities, ready = true, fetching = false }) => {
  // Update the entities.
  Object.entries(entities).map(([type, single]) => {
    Object.entries(single).map(([id, entity]) => {
      addEntity({ self, type, id, entity, ready, fetching });
    });
  });
};

export const init = ({ self, listType, listId, page, singleType, singleId, fetching }) => {
  if (listType) {
    // Init the first map (type) if it's not initializated yet.
    if (!self.listMap.get(listType)) self.listMap.set(listType, {});
    const list = self.listMap.get(listType);
    if (!list.get(listId)) list.set(listId, {});
    list.get(listId).fetching = fetching;
    if (!list.get(listId).pageMap.get(page - 1)) list.get(listId).pageMap.set(page - 1, {});
    list.get(listId).pageMap.get(page - 1).fetching = fetching;
  } else {
    addEntity({ self, type: singleType, id: singleId, fetching });
  }
};

export const actions = self => ({
  [actionTypes.SINGLE_REQUESTED]({ singleType, singleId }) {
    init({ self, singleType, singleId, fetching: true });
  },
  [actionTypes.SINGLE_FAILED]({ singleType, singleId }) {
    // Populate the state with the entity value and set both fetching and ready.
    self.single[singleType][singleId].fetching = false;
  },
  [actionTypes.SINGLE_SUCCEED]({ entities }) {
    addEntities({ self, entities, ready: true, fetching: false });
  },
  [actionTypes.LIST_REQUESTED]({ listType, listId, page }) {
    init({ self, listType, listId, page, fetching: true });
  },
  [actionTypes.LIST_SUCCEED]({ listType, listId, page, total, result, entities }) {
    // Update the list.
    const list = self.listMap.get(listType).get(listId);
    list.fetching = false;
    list.ready = true;
    list.pageMap.get(page - 1).fetching = false;
    list.pageMap.get(page - 1).ready = true;
    list.pageMap.get(page - 1).entities = result;
    if (total) list.total = total;
    addEntities({ self, entities, ready: true, fetching: false });
  },
  [actionTypes.LIST_FAILED]({ listType, listId, page }) {
    // Populate the state with the entity value and set both fetching and ready.
    self.listMap.get(listType).get(listId).fetching = false;
    self.listMap
      .get(listType)
      .get(listId)
      .pageMap.get(page - 1).fetching = false;
  },
  [actionTypes.CUSTOM_REQUESTED]({ url, params, name, page }) {
    if (!self.customMap.get(name)) self.customMap.set(name, {});
    const custom = self.customMap.get(name);
    custom.fetching = true;
    custom.url = url;
    custom.params = params;
    if (!custom.pageMap.get(page - 1)) custom.pageMap.set(page - 1, {});
    custom.pageMap.get(page - 1).fetching = true;
  },
  [actionTypes.CUSTOM_SUCCEED]({ name, page, total, result, entities }) {
    const custom = self.customMap.get(name);
    custom.fetching = false;
    custom.ready = true;
    custom.pageMap.get(page - 1).fetching = false;
    custom.pageMap.get(page - 1).ready = true;
    custom.pageMap.get(page - 1).entities = result;
    custom.total = total;
    addEntities({ self, entities, ready: true, fetching: false });
  },
  [actionTypes.CUSTOM_FAILED]({ name, page }) {
    const custom = self.customMap.get(name);
    custom.fetching = false;
    custom.pageMap.get(page - 1).fetching = false;
  },
  [actionTypes.SITE_INFO_SUCCEED]({ home: { title, description }, perPage }) {
    self.siteInfo.home.title = title;
    self.siteInfo.home.description = description;
    self.siteInfo.perPage = perPage;
  },
});
