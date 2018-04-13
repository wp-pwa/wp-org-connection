import { values, observable } from 'mobx';
import { types, getParent, resolveIdentifier, getSnapshot } from 'mobx-state-tree';
import { flatten } from 'lodash';
import { entityShape } from './entity-shape';
import { pageShape } from './list-shape';
import Entity from './entity';

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
    fetching: false,
    entities: types.optional(types.array(types.reference(Entity)), observable([])),
  })
  .views(self => ({
    get ready() {
      return self.entities.length > 0;
    },
    get total() {
      return self.entities.length || null;
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
    get ready() {
      return values(self.pageMap)
        .map(page => page.ready)
        .reduce((acc, cur) => acc || cur, false);
    },
    get fetching() {
      return values(self.pageMap)
        .map(page => page.fetching)
        .reduce((acc, cur) => acc || cur, false);
    },
    get entities() {
      const mstIds = flatten(self.pages.map(page => getSnapshot(page.entities)));
      return observable(mstIds.map(mstId => resolveIdentifier(Entity, self, mstId)));
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
