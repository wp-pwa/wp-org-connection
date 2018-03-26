import { values } from 'mobx';
import { types, resolveIdentifier, getSnapshot } from 'mobx-state-tree';
import { flatten } from 'lodash';
import Entity from './entity';
import { Total, Page } from './list';
import { pageShape } from './list-shape';

const Custom = types
  .model('Custom')
  .props({
    name: types.identifier(types.string),
    pageMap: types.optional(types.map(Page), {}),
    total: types.optional(Total, {}),
    url: types.optional(types.string, '/'),
    params: types.optional(types.frozen, {}),
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
      return mstIds.map(mstId => resolveIdentifier(Entity, self, mstId));
    },
    page(page) {
      return self.pageMap.get(page) || pageShape;
    },
    get pages() {
      return values(self.pageMap);
    },
  }));

export default Custom;
