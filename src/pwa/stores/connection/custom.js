import { values, observable } from 'mobx';
import { types, getParent } from 'mobx-state-tree';
import { flatten } from 'lodash';
import { Total, Page } from './list';
import { pageShape } from './list-shape';
import { extract } from './utils';

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
      return observable(
        results.map(mstId => {
          const { type, id } = extract(mstId);
          return getParent(self, 2).entity(type, id);
        }),
      );
    },
    page(page) {
      const strPage = page.toString();
      return self.pageMap.get(strPage) || pageShape;
    },
    get pages() {
      return values(self.pageMap);
    },
  }));

export default Custom;
