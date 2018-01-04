import { types } from 'mobx-state-tree';
import { Entity, Entities } from './entity';
import { List } from './list';
import { Custom } from './custom';
import SiteInfo from './site-info';
import { extractList } from '../router';
import * as actionTypes from '../../actionTypes';
import convert from '../../converters';

export const props = {
  // Used to initalizate entities before they exist.
  entityInits: types.optional(types.map(Entity), {}),
  // Used to store entities when they are retrieved from the API.
  entities: types.optional(types.map(types.map(Entities)), {}),
  // Used to 
  lists: types.optional(types.map(List), {}),
  customs: types.optional(types.map(Custom), {}),
  siteInfo: types.optional(SiteInfo, {}),
};

export const views = self => ({
  entity(entityType, entityId) {
    self.initEntity({ entityType, entityId });
    return self.entities.get(`${entityType}_${entityId}`);
  },
  list(listType, listId) {
    self.initList({ listType, listId });
    return self.lists.get(`${listType}_${listId}`);
  },
  custom(name) {
    self.initCustom({ name });
    return self.customs.get(name);
  },
});

export const actions = self => ({
  initEntity({ entityType, entityId }) {
    const mstId = `${entityType}_${entityId}`;
    if (!self.entities.get(mstId))
      self.entities.put({ mstId, id: entityId, type: entityType });
  },
  initList({ listType, listId }) {
    const mstId = `${listType}_${listId}`;
    if (!self.lists.get(mstId))
      self.lists.put({ mstId, id: listId, type: listType });
  },
  addResource({ type, id, entity }) {
    if (!self.resources.get(type)) self.resources.set(type, {});
    self.resources.get(type).set(id, convert(entity));
  },
  addResources({ entities }) {
    Object.entries(entities).map(([type, single]) => {
      Object.entries(single).map(([id, entity]) => {
        self.addResource({ type, id, entity });
      });
    });
  },
  initCustom({ name }) {
    if (!self.customs.get(name)) self.customs.set(name, {});
  },
  [actionTypes.SINGLE_REQUESTED]({ entityType, entityId }) {
    // self.single(entityType, entityId).fetching = true;
  },
  [actionTypes.SINGLE_FAILED]({ entityType, entityId }) {
    // self.single(entityType, entityId).fetching = false;
  },
  [actionTypes.SINGLE_SUCCEED]({ entities }) {
    // self.addEntities({ entities, ready: true, fetching: false });
  },
  [actionTypes.LIST_REQUESTED]({ listType, listId, page }) {
    // self.list(listType, listId).fetching = true;
    // self.list(listType, listId).page(page);
    // init({ self, listType, listId, page, fetching: true });
  },
  [actionTypes.LIST_SUCCEED]({ listType, listId, page, total, result, entities }) {
    // Update the list.
    // const list = self.listMap.get(listType).get(listId);
    // list.fetching = false;
    // list.ready = true;
    // list.pageMap.get(page - 1).fetching = false;
    // list.pageMap.get(page - 1).ready = true;
    // list.pageMap.get(page - 1).entities = result;
    // if (total) list.total = total;
    //
    // addEntities({ self, entities, ready: true, fetching: false });
    // if (self.context) extractList({ listType, listId, page, result }, self.context);
  },
  [actionTypes.LIST_FAILED]({ listType, listId, page }) {
    // Populate the state with the entity value and set both fetching and ready.
    // self.listMap.get(listType).get(listId).fetching = false;
    // self.listMap
    //   .get(listType)
    //   .get(listId)
    //   .pageMap.get(page - 1).fetching = false;
  },
  [actionTypes.CUSTOM_REQUESTED]({ url, params, name, page }) {
    // if (!self.customMap.get(name)) self.customMap.set(name, {});
    // const custom = self.customMap.get(name);
    // custom.fetching = true;
    // custom.url = url;
    // custom.params = params;
    // if (!custom.pageMap.get(page - 1)) custom.pageMap.set(page - 1, {});
    // custom.pageMap.get(page - 1).fetching = true;
  },
  [actionTypes.CUSTOM_SUCCEED]({ name, page, total, result, entities }) {
    // const custom = self.customMap.get(name);
    // custom.fetching = false;
    // custom.ready = true;
    // custom.pageMap.get(page - 1).fetching = false;
    // custom.pageMap.get(page - 1).ready = true;
    // custom.pageMap.get(page - 1).entities = result;
    // custom.total = total;
    // addEntities({ self, entities, ready: true, fetching: false });
  },
  [actionTypes.CUSTOM_FAILED]({ name, page }) {
    // const custom = self.customMap.get(name);
    // custom.fetching = false;
    // custom.pageMap.get(page - 1).fetching = false;
  },
  [actionTypes.SITE_INFO_SUCCEED]({ home: { title, description }, perPage }) {
    // self.siteInfo.home.title = title;
    // self.siteInfo.home.description = description;
    // self.siteInfo.perPage = perPage;
  },
});
