/* eslint-disable no-underscore-dangle */
import { types, resolveIdentifier, flow, getParent, getEnv } from 'mobx-state-tree';
import { normalize } from 'normalizr';
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
import * as schemas from '../../schemas';

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
  get root() {
    return getParent(self);
  },
});

export const actions = self => ({
  fetchEntity: flow(function* fetch({ type, id }) {
    // Don't fetch if entity is already fetching or ready.
    if (self.entity(type, id).isReady || self.entity(type, id).isFetching) return;

    const entity = self.getEntity({ type, id });
    entity.isFetching = true;
    entity.hasFailed = false;
    try {
      const { getEntity } = getEnv(self).connection;
      const response = yield getEntity({ type, id });
      const { entities } = normalize(response, schemas.entity);
      self.addEntities({ entities });
      entity.isFetching = false;
    } catch (error) {
      entity.isFetching = false;
      entity.hasFailed = true;
    }
  }),
  fetchListPage: flow(function* fetch({ type, id, page }) {
    if (!['latest', 'category', 'tag', 'author'].includes(type)) {
      throw new Error(
        'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.',
      );
    }
    // Don't fetch if list is already fetching or ready.
    if (self.list(type, id).page(page).isReady || self.list(type, id).page(page).isFetching) return;

    const listPage = self.getListPage({ type, id, page });
    listPage.isFetching = true;
    listPage.hasFailed = false;
    try {
      const perPage = self.root.settings.connection.perPage || self.root.settings.build.perPage;
      const { getListPage } = getEnv(self).connection;
      const response = yield getListPage({ type, id, page, perPage });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };
      self.addListPage({ type, id, page, total, result, entities });
      listPage.isFetching = false;
    } catch (error) {
      listPage.isFetching = false;
      listPage.hasFailed = true;
    }
  }),
  fetchCustomPage: flow(function* fetch({ name, type, page, params, url }) {
    // Don't fetch if list is already fetching or ready.
    if (self.custom(name).page(page).isReady || self.custom(name).page(page).isFetching) return;

    const custom = self.getCustom({ name });
    custom.params = params;
    custom.url = url;
    const customPage = self.getCustomPage({ name, page });
    customPage.isFetching = true;
    customPage.hasFailed = false;
    try {
      const { getCustomPage } = getEnv(self).connection;
      const response = yield getCustomPage({ type, page, params });
      const { entities, result } = normalize(response, schemas.list);
      const totalEntities = response._paging ? parseInt(response._paging.total, 10) : 0;
      const totalPages = response._paging ? parseInt(response._paging.totalPages, 10) : 0;
      const total = { entities: totalEntities, pages: totalPages };
      self.addCustomPage({ name, page, result, entities, total });
      customPage.isFetching = false;
    } catch (error) {
      customPage.isFetching = false;
      customPage.hasFailed = true;
    }
  }),
  getEntity({ type, id }) {
    const mstId = join(type, id);
    if (!self.entities.get(mstId)) self.entities.set(mstId, { mstId, type, id });
    return self.entities.get(mstId);
  },
  fetchingEntity({ type, id }) {
    const item = self.getEntity({ type, id });
    item.isFetching = true;
  },
  addEntity({ entity }) {
    // Don't add entity if it doesn't have id or type
    if (!entity.id || !entity.type) return;
    const item = self.getEntity({ type: entity.type, id: entity.id });
    if (!item.entity) item.entity = convert(entity);
    item.isFetching = false;
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
    item.isFetching = true;
  },
  addListPage({ type, id, page, result, entities, total }) {
    self.addEntities({ entities });
    const mstResults = result.map(res => `${entities[res.schema][res.id].type}_${res.id}`);
    const listPage = self.getListPage({ type, id, page });
    listPage.results = mstResults;
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
    item.isFetching = true;
  },
  addCustomPage({ name, page = 1, result, entities, total }) {
    self.addEntities({ entities });
    const mstResults = result.map(res => `${entities[res.schema][res.id].type}_${res.id}`);
    const item = self.getCustomPage({ name, page });
    item.results = mstResults;
    item.isFetching = false;
    if (total) {
      const list = self.getCustom({ name });
      if (total.entities) list.total.entities = total.entities;
      if (total.pages) list.total.pages = total.pages;
    }
  },
  [actionTypes.CUSTOM_REQUESTED]({ custom: { name, page }, params, url }) {
    const custom = self.getCustom({ name });
    custom.params = params;
    custom.url = url;
    const item = self.getCustomPage({ name, page });
    item.isFetching = true;
  },
  [actionTypes.CUSTOM_SUCCEED]({ custom: { name, page }, total, result, entities }) {
    self.addCustomPage({ name, page, total, result, entities });
  },
  [actionTypes.CUSTOM_FAILED]({ custom: { name, page } }) {
    const item = self.getCustomPage({ name, page });
    item.isFetching = false;
  },
  [actionTypes.HEAD_CONTENT_SUCCEED]({ title, content }) {
    self.siteInfo.headTitle = title;
    self.siteInfo.headContent = content;
  },
  [actionTypes.SITE_INFO_SUCCEED]({ perPage }) {
    self.siteInfo.perPage = perPage;
  },
});
