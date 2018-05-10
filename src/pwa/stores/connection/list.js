import { values, observable } from 'mobx';
import { types, getParent, resolveIdentifier, getRoot } from 'mobx-state-tree';
import { flatten } from 'lodash';
import { entityShape } from './entity-shape';
import { pageShape } from './list-shape';
import Entity from './entity';
import { extract } from './utils';

export const Total = types
  .model('Total')
  .props({
    entities: types.maybe(types.number),
    pages: types.maybe(types.number),
  })
  .views(self => ({
    get fetched() {
      return {
        entities: getParent(self).entities.length || 0,
        pages: getParent(self).pages.length || 0,
      };
    },
  }));

export const Page = types
  .model('Page')
  .props({
    page: types.identifier(types.number),
    isFetching: false,
    hasFailed: false,
    results: types.optional(types.array(types.string), observable([])),
  })
  .views(self => ({
    get connection() {
      return getRoot(self).connection || getRoot(self);
    },
    get entities() {
      return observable(self.results.map(mstId => {
        const { type, id } = extract(mstId);
        return self.connection.entity(type, id);
      }));
    },
    get isReady() {
      return self.results.length > 0;
    },
    get total() {
      return self.results.length || null;
    },
  }));

const List = types
  .model('List')
  .props({
    mstId: types.identifier(types.string), // latest_post, category_7, movie_34, author_3
    type: types.string,
    id: types.union(types.string, types.number),
    pageMap: types.optional(types.map(Page), {}),
    total: types.optional(Total, {}),
  })
  .views(self => ({
    get isReady() {
      return values(self.pageMap)
        .map(page => page.isReady)
        .reduce((acc, cur) => acc || cur, false);
    },
    get isFetching() {
      return values(self.pageMap)
        .map(page => page.isFetching)
        .reduce((acc, cur) => acc || cur, false);
    },
    get hasFailed() {
      return values(self.pageMap)
        .map(page => page.hasFailed)
        .reduce((acc, cur) => acc || cur, false);
    },
    get entities() {
      const results = flatten(self.pages.map(page => page.results.peek()));
      return observable(results.map(mstId => {
        const { type, id } = extract(mstId);
        return getParent(self, 2).entity(type, id);
      }));
    },
    page(page) {
      return self.pageMap.get(page) || self.pageMap.get(String(page)) || pageShape;
    },
    get pages() {
      return values(self.pageMap);
    },
    get entity() {
      return resolveIdentifier(Entity, self, self.mstId) || entityShape(self.type, self.id);
    },
  }));

export default List;
