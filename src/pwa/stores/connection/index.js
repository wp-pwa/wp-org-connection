import { types, resolveIdentifier } from 'mobx-state-tree';
import { join } from './utils';
import Entity from './entity';
import entityShape from './entity-shape';
import listShape from './list-shape';
import customShape from './custom-shape';
import List from './list';
import Custom from './custom';
import SiteInfo from './site-info';
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
    if (!self.entities.get(mstId)) self.entities.set(mstId, { mstId, type, id });
    return self.entities.get(mstId);
  },
  fetchingEntity({ type, id }) {
    const item = self.getEntity({ type, id });
    item.fetching = true;
  },
  addEntity({ entity }) {
    // Don't add entity if it doesn't have id or type or it is protected
    if (!entity.id || !entity.type || (entity.content && entity.content.protected)) return;
    const item = self.getEntity({ type: entity.type, id: entity.id });
    if (!item.entity) item.entity = convert(entity);
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
    if (!self.lists.get(mstId)) self.lists.set(mstId, { mstId, type, id });
    return self.lists.get(mstId);
  },
  getListPage({ type, id, page }) {
    const list = self.getList({ type, id });
    if (!list.pageMap.get(page)) list.pageMap.set(page, { page });
    return list.pageMap.get(page);
  },
  fetchingListPage({ type, id, page }) {
    const item = self.getListPage({ type, id, page });
    item.fetching = true;
  },
  addListPage({ type, id, page, result, entities, total }) {
    self.addEntities({ entities });
    const mstResults = result.map(res => `${entities[res.schema][res.id].type}_${res.id}`);
    const item = self.getListPage({ type, id, page });
    item.results = mstResults;
    item.fetching = false;
    if (total) {
      const list = self.getList({ type, id });
      if (total.entities) list.total.entities = total.entities;
      if (total.pages) list.total.pages = total.pages;
    }
  },
  getCustom({ name }) {
    if (!self.customs.get(name)) self.customs.set(name, { name });
    return self.customs.get(name);
  },
  getCustomPage({ name, page = 1 }) {
    const custom = self.getCustom({ name });
    if (!custom.pageMap.get(page)) custom.pageMap.set(page, { page });
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
    item.results = mstResults;
    item.fetching = false;
    if (total) {
      const list = self.getCustom({ name });
      if (total.entities) list.total.entities = total.entities;
      if (total.pages) list.total.pages = total.pages;
    }
  },
  [actionTypes.ENTITY_REQUESTED]({ entity: { type, id } }) {
    self.fetchingEntity({ type, id });
  },
  [actionTypes.ENTITY_SUCCEED]({ entities }) {
    self.addEntities({ entities });
  },
  [actionTypes.ENTITY_FAILED]({ entity: { type, id } }) {
    const item = self.getEntity({ type, id });
    item.fetching = false;
  },
  [actionTypes.LIST_REQUESTED]({ list: { type, id, page } }) {
    self.fetchingListPage({ type, id, page });
  },
  [actionTypes.LIST_SUCCEED]({ list: { type, id, page }, total, result, entities }) {
    self.addListPage({ type, id, page, total, result, entities });
  },
  [actionTypes.LIST_FAILED]({ list: { type, id, page } }) {
    const item = self.getListPage({ type, id, page });
    item.fetching = false;
  },
  [actionTypes.CUSTOM_REQUESTED]({ custom: { name, page }, params, url }) {
    const custom = self.getCustom({ name });
    custom.params = params;
    custom.url = url;
    const item = self.getCustomPage({ name, page });
    item.fetching = true;
  },
  [actionTypes.CUSTOM_SUCCEED]({ custom: { name, page }, total, result, entities }) {
    self.addCustomPage({ name, page, total, result, entities });
  },
  [actionTypes.CUSTOM_FAILED]({ custom: { name, page } }) {
    const item = self.getCustomPage({ name, page });
    item.fetching = false;
  },
  [actionTypes.HEAD_CONTENT_SUCCEED]({ title, content }) {
    self.siteInfo.headTitle = title;
    self.siteInfo.headContent = content;
  },
  [actionTypes.SITE_INFO_SUCCEED]({ perPage }) {
    self.siteInfo.perPage = perPage;
  },
});
