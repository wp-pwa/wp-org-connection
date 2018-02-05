import { types, resolveIdentifier } from 'mobx-state-tree';
import { join } from './utils';
import Entity from './entity';
import entityShape from './entity-shape';
import listShape from './list-shape';
import List from './list';
// import { Custom } from './custom';
import SiteInfo from './site-info';
import { extractList } from '../router';
import * as actionTypes from '../../actionTypes';
import convert from '../../converters';

export const props = {
  entities: types.optional(types.map(Entity), {}),
  lists: types.optional(types.map(List), {}),
  // customs: types.optional(types.map(Custom), {}),
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
    return resolveIdentifier(Entity, self, mstId) || entityShape(type, id);
  },
  list(type, id) {
    const mstId = join(type, id);
    return resolveIdentifier(List, self, mstId) || listShape(type, id);
  },
  custom(name) {
    self.initCustomMap({ name });
    return self.customMap.get(name);
  },
});

export const actions = self => ({
  getEntity({ type, id }) {
    const mstId = join(type, id);
    if (!self.entities.get(mstId)) self.entities.put({ mstId, type, id });
    return self.entities.get(mstId);
  },
  fetchingEntity({ type, id }) {
    const item = self.getEntity({ type, id });
    item.fetching = true;
  },
  addEntity({ entity }) {
    const item = self.getEntity({ type: entity.type, id: entity.id });
    item.entity = convert(entity);
    item.fetching = false;
  },
  addEntities({ entities }) {
    Object.entries(entities).map(([, single]) => {
      Object.entries(single).map(([, entity]) => {
        self.addEntity({ entity });
      });
    });
  },
  getList({ type, id }) {
    const mstId = join(type, id);
    if (!self.lists.get(mstId)) self.lists.put({ mstId, type, id });
    return self.lists.get(mstId);
  },
  getPage({ type, id, page }) {
    const list = self.getList({ type, id });
    if (!list.pageMap.get(page)) list.pageMap.put({ page });
    return list.pageMap.get(page);
  },
  fetchingPage({ type, id, page }) {
    const item = self.getPage({ type, id, page });
    item.fetching = true;
  },
  addPage({ type, id, page = 1, result, entities, total }) {
    self.addEntities({ entities });
    const mstResults = result.map(res => `${entities[res.schema][res.id].type}_${res.id}`);
    const item = self.getPage({ type, id, page });
    item.entities = mstResults;
    item.fetching = false;
    if (total) {
      const list = self.getList({ type, id });
      if (total.entities) list.total.entities = total.entities;
      if (total.pages) list.total.pages = total.pages;
    }
  },
  [actionTypes.SINGLE_REQUESTED]({ singleType: type, singleId: id }) {
    self.fetchingEntity({ type, id });
  },
  [actionTypes.SINGLE_SUCCEED]({ entities }) {
    self.addEntities({ entities });
  },
  [actionTypes.SINGLE_FAILED]({ singleType: type, singleId: id }) {
    const item = self.getEntity({ type, id });
    item.fetching = false;
  },
  [actionTypes.LIST_REQUESTED]({ listType: type, listId: id, page = 1 }) {
    self.fetchingPage({ type, id, page });
  },
  [actionTypes.LIST_SUCCEED]({ listType, listId, page, total, result, entities }) {
    self.addPage({ type: listType, id: listId, page, total, result, entities });
    if (self.context) extractList({ listType, listId, page, result }, self.context);
  },
  [actionTypes.LIST_FAILED]({ listType: type, listId: id, page = 1 }) {
    const item = self.getPage({ type, id, page });
    item.fetching = false;
  },
});
