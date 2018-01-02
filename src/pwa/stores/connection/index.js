import { types } from 'mobx-state-tree';
import { Single, Any } from './single';
import { List } from './list';
import { Custom } from './custom';
import SiteInfo from './site-info';
import { extractList } from '../router';
import * as actionTypes from '../../actionTypes';
import convert from '../../converters';

export const props = {
  entitiesMap: types.optional(types.map(types.map(Any)), {}),
  singleMap: types.optional(types.map(Single), {}),
  listMap: types.optional(types.map(types.map(List)), {}),
  customMap: types.optional(types.map(Custom), {}),
  siteInfo: types.optional(SiteInfo, {}),
};

export const views = self => ({
  single(singleType, singleId) {
    self.initSingle({ singleType, singleId });
    return self.singleMap.get(`${singleType}_${singleId}`);
  },
  list(listType, listId) {
    self.initList({ listType, listId });
    return self.listMap.get(listType).get(listId);
  },
  custom(name) {
    self.initCustom({ name });
    return self.listMap.get(name);
  },
});

export const actions = self => ({
  addEntity({ type, id, entity }) {
    // Create entity map if it's not created yet.
    if (!self.entitiesMap.get(type)) self.entitiesMap.set(type, {});
    // Add the entity.
    self.entitiesMap.get(type).set(id, convert(entity));
  },
  addEntities({ entities }) {
    // Update the entities.
    Object.entries(entities).map(([type, single]) => {
      Object.entries(single).map(([id, entity]) => {
        self.addEntity({ type, id, entity });
      });
    });
  },
  initList({ listType, listId }) {
    if (!self.listMap.get(listType)) self.listMap.set(listType, {});
    if (!self.listMap.get(listType).get(listId)) self.listMap.get(listType).set(listId, {});
  },
  initSingle({ singleType, singleId }) {
    const mstId = `${singleType}_${singleId}`;
    if (!self.singleMap.get(mstId))
      self.singleMap.set(mstId, { mstId, id: singleId, type: singleType });
  },
  initCustom({ name }) {
    if (!self.customMap.get(name)) self.customMap.set(name, {});
  },
  [actionTypes.SINGLE_REQUESTED]({ singleType, singleId }) {
    // self.single(singleType, singleId).fetching = true;
  },
  [actionTypes.SINGLE_FAILED]({ singleType, singleId }) {
    // self.single(singleType, singleId).fetching = false;
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
