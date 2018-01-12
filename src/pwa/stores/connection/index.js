import { types } from 'mobx-state-tree';
import { join , extract } from './utils';
import { Entity } from './entity';
import entityShape from './entity-shape';
import { List } from './list';
import { Custom } from './custom';
import SiteInfo from './site-info';
import { extractList } from '../router';
import * as actionTypes from '../../actionTypes';
import convert from '../../converters';

export const props = {
  entities: types.optional(types.map(Entity), {}),
  lists: types.optional(types.map(List), {}),
  customs: types.optional(types.map(Custom), {}),
  siteInfo: types.optional(SiteInfo, {}),
  typeRelations: types.optional(types.map(types.string), {
    post: 'single',
    page: 'single',
    category: 'taxonomy',
    tag: 'taxonomy',
  }),
};

export const views = self => ({
  entity(type, id) {
    const mstId = join(type, id);
    return self.entities.has(mstId) ? self.entities.get(mstId) : entityShape;
  },
  list(type, id) {
    self.initListMap({ type, id });
    return self.listMap.get(`${type}_${id}`);
  },
  custom(name) {
    self.initCustomMap({ name });
    return self.customMap.get(name);
  },
});

export const actions = self => ({
  initEntityMap({ type, id }) {
    // debugger;
    const mstId = `${type}_${id}`;
    if (!self.entities.get(type)) self.entities.set(type, {});
    if (!self.entityMap.get(mstId)) self.entityMap.put({ mstId, type, id, entity: mstId });
  },
  initListMap({ type, id }) {
    const mstId = `${type}_${id}`;
    if (!self.listMap.get(mstId)) self.listMap.put({ mstId, type, id });
  },
  initCustomMap({ name }) {
    if (!self.customMap.get(name)) self.customMap.put({ name });
  },
  addEntity({ type, entity }) {
    if (!self.entities.get(type)) self.entities.set(type, {});
    self.entities.get(type).put(convert(entity));
  },
  addEntities({ entities }) {
    Object.entries(entities).map(([type, single]) => {
      Object.entries(single).map(([id, entity]) => {
        self.addEntity({ type, id, entity });
      });
    });
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
