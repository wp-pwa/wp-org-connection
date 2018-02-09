import { types, resolveIdentifier } from 'mobx-state-tree';
import { join } from './utils';
import Entity from './entity';
import entityShape from './entity-shape';
import listShape from './list-shape';
import customShape from './custom-shape';
import List from './list';
import Custom from './custom';
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
    return resolveIdentifier(Entity, self, mstId) || entityShape(type, id);
  },
  list(type, id) {
    const mstId = join(type, id);
    return resolveIdentifier(List, self, mstId) || listShape(type, id);
  },
  custom(name) {
    return resolveIdentifier(Custom, self, name) || customShape(name);
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
  getListPage({ type, id, page }) {
    const list = self.getList({ type, id });
    if (!list.pageMap.get(page)) list.pageMap.put({ page });
    return list.pageMap.get(page);
  },
  fetchingListPage({ type, id, page }) {
    const item = self.getListPage({ type, id, page });
    item.fetching = true;
  },
  addListPage({ type, id, page = 1, result, entities, total }) {
    self.addEntities({ entities });
    const mstResults = result.map(res => `${entities[res.schema][res.id].type}_${res.id}`);
    const item = self.getListPage({ type, id, page });
    item.entities = mstResults;
    item.fetching = false;
    if (total) {
      const list = self.getList({ type, id });
      if (total.entities) list.total.entities = total.entities;
      if (total.pages) list.total.pages = total.pages;
    }
  },
  getCustom({ name }) {
    if (!self.customs.get(name)) self.customs.put({ name });
    return self.customs.get(name);
  },
  getCustomPage({ name, page = 1 }) {
    const custom = self.getCustom({ name });
    if (!custom.pageMap.get(page)) custom.pageMap.put({ page });
    return custom.pageMap.get(page);
  },
  fetchingCustomPage({ name, page = 1 }) {
    const item = self.getCustomPage({ name, page });
    item.fetching = true;
  },
  addCustomPage({ name, page = 1, result, entities, total }) {
    self.addEntities({ entities });
    const mstResults = result.map(res => `${entities[res.schema][res.id].type}_${res.id}`);
    const item = self.getCustomPage({ name, page });
    item.entities = mstResults;
    item.fetching = false;
    if (total) {
      const list = self.getCustom({ name });
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
    self.fetchingListPage({ type, id, page });
  },
  [actionTypes.LIST_SUCCEED]({ listType, listId, page, total, result, entities }) {
    self.addListPage({ type: listType, id: listId, page, total, result, entities });
    if (self.context) extractList({ listType, listId, page, result }, self.context);
  },
  [actionTypes.LIST_FAILED]({ listType: type, listId: id, page = 1 }) {
    const item = self.getListPage({ type, id, page });
    item.fetching = false;
  },
  [actionTypes.HEAD_CONTENT_SUCCEED]({ content }) {
    self.siteInfo.headContent = content;
  }
});
