/* eslint-disable no-underscore-dangle, no-console */
import {
  types,
  resolveIdentifier,
  flow,
  getParent,
  getEnv,
} from 'mobx-state-tree';
import { normalize } from 'normalizr';
import { decode } from 'he';
import getHeadContent from './head/getHeadContent';
import { join } from './utils';
import Entity from './entity';
import entityShape from './entity-shape';
import listShape from './list-shape';
import customShape from './custom-shape';
import List from './list';
import Custom from './custom';
import Head from './head';
import * as schemas from '../../schemas';

const dev = process.env.NODE_ENV !== 'production';

export const props = {
  entities: types.optional(types.map(Entity), {}),
  lists: types.optional(types.map(List), {}),
  customs: types.optional(types.map(Custom), {}),
  head: types.optional(Head, {}),
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

export const actions = self => {
  let wpapi = null;
  return {
    initApi: () => {
      if (wpapi) return;
      const { WpApi } = getEnv(self).connection;
      const cptEndpoints = self.root.settings.connection.cptEndpoints || {};
      const siteUrl = self.root.settings.generalSite.url || {};
      wpapi = new WpApi({ cptEndpoints, siteUrl });
    },
    fetchEntity: flow(function* fetch({ type, id, force = false }) {
      self.initApi();
      // Don't fetch if entity is already fetching or ready.
      if (
        !force &&
        (self.entity(type, id).isReady || self.entity(type, id).isFetching)
      )
        return;

      const entity = self.getEntity({ type, id });
      entity.isFetching = true;
      entity.hasFailed = false;
      try {
        const response = yield wpapi.getEntity({ type, id });
        const { entities } = normalize(response, schemas.entity);
        self.addEntities({ entities });
        entity.isFetching = false;
      } catch (error) {
        if (dev)
          console.warn(
            `fetchEntity failed: { type: ${type}, id: ${id} }`,
            error,
          );
        entity.isFetching = false;
        entity.hasFailed = true;
      }
    }),
    fetchListPage: flow(function* fetch({ type, id, page, force = false }) {
      self.initApi();
      if (!['latest', 'category', 'tag', 'author'].includes(type)) {
        throw new Error(
          'Custom taxonomies should retrieve their custom post types first. NOT IMPLEMENTED.',
        );
      }
      // Don't fetch if list is already fetching or ready
      if (
        !force &&
        (self.list(type, id).page(page).isReady ||
          self.list(type, id).page(page).isFetching)
      )
        return;

      const listPage = self.getListPage({ type, id, page });
      listPage.isFetching = true;
      listPage.hasFailed = false;
      try {
        const perPage =
          self.root.settings.connection.perPage || self.root.build.perPage;
        const response = yield wpapi.getListPage({ type, id, page, perPage });
        const { entities, result } = normalize(response, schemas.list);
        const totalEntities = response._paging
          ? parseInt(response._paging.total, 10)
          : 0;
        const totalPages = response._paging
          ? parseInt(response._paging.totalPages, 10)
          : 0;
        const total = { entities: totalEntities, pages: totalPages };
        self.addListPage({ type, id, page, total, result, entities });
        listPage.isFetching = false;
      } catch (error) {
        if (dev)
          console.warn(
            `fetchListPage failed: { type: ${type}, id: ${id}, page: ${page} }`,
            error,
          );
        listPage.isFetching = false;
        listPage.hasFailed = true;
      }
    }),
    fetchCustomPage: flow(function* fetch({ name, type, page, params, url }) {
      self.initApi();
      // Don't fetch if list is already fetching or ready.
      if (
        self.custom(name).page(page).isReady ||
        self.custom(name).page(page).isFetching
      )
        return;

      const custom = self.getCustom({ name });
      custom.params = params;
      custom.url = url;
      const customPage = self.getCustomPage({ name, page });
      customPage.isFetching = true;
      customPage.hasFailed = false;
      try {
        const response = yield wpapi.getCustomPage({ type, page, params });
        const { entities, result } = normalize(response, schemas.list);
        const totalEntities = response._paging
          ? parseInt(response._paging.total, 10)
          : 0;
        const totalPages = response._paging
          ? parseInt(response._paging.totalPages, 10)
          : 0;
        const total = { entities: totalEntities, pages: totalPages };
        self.addCustomPage({ name, page, result, entities, total });
        customPage.isFetching = false;
      } catch (error) {
        if (dev)
          console.warn(`fetchCustomPage failed: { name: ${name} }`, error);
        customPage.isFetching = false;
        customPage.hasFailed = true;
      }
    }),
    getEntity({ type, id }) {
      const mstId = join(type, id);
      if (!self.entities.get(mstId))
        self.entities.set(mstId, { mstId, type, id });
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
      if (!item.raw) item.raw = entity;
      item.isFetching = false;
    },
    addEntities({ entities }) {
      Object.entries(entities).forEach(([, single]) => {
        Object.entries(single).forEach(([, entity]) => {
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
      const strPage = page.toString();
      const list = self.getList({ type, id });
      if (!list.pageMap.get(strPage)) {
        list.pageMap.set(strPage, { page: strPage });
      }
      return list.pageMap.get(strPage);
    },
    fetchingListPage({ type, id, page }) {
      const strPage = page.toString();
      const item = self.getListPage({ type, id, page: strPage });
      item.isFetching = true;
    },
    addListPage({ type, id, page, result, entities, total }) {
      const strPage = page.toString();
      self.addEntities({ entities });
      const mstResults = result.map(
        res => `${entities[res.schema][res.id].type}_${res.id}`,
      );
      const listPage = self.getListPage({ type, id, page: strPage });
      listPage.results = mstResults;
      listPage.isFetching = false;
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
      const strPage = page.toString();
      const custom = self.getCustom({ name });
      if (!custom.pageMap.get(strPage))
        custom.pageMap.set(strPage, { page: strPage });
      return custom.pageMap.get(strPage);
    },
    fetchingCustomPage({ name, page = 1 }) {
      const strPage = page.toString();
      const item = self.getCustomPage({ name, page: strPage });
      item.isFetching = true;
    },
    addCustomPage({ name, page = 1, result, entities, total }) {
      const strPage = page.toString();
      self.addEntities({ entities });
      const mstResults = result.map(
        res => `${entities[res.schema][res.id].type}_${res.id}`,
      );
      const item = self.getCustomPage({ name, page: strPage });
      item.results = mstResults;
      item.isFetching = false;
      if (total) {
        const list = self.getCustom({ name });
        if (total.entities) list.total.entities = total.entities;
        if (total.pages) list.total.pages = total.pages;
      }
    },
    fetchHeadContent: flow(function* fetchHeadContent() {
      try {
        self.head.hasFailed = false;
        const url = self.root.build.initialUrl;

        if (!url) throw new Error('No initial url found.');

        const { text: html } = yield getEnv(self).request(url);
        const headHtml = html.match(
          /<\s*?head[^>]*>([\w\W]+)<\s*?\/\s*?head\s*?>/,
        )[1];
        const { title, content } = getHeadContent(headHtml);

        self.head.title = decode(title);
        self.head.content = content;
      } catch (error) {
        self.head.hasFailed = true;
      }
    }),
  };
};
