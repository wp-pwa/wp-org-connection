import { types } from 'mobx-state-tree';
import { Total } from './list';
import { Any } from './single';

const Page = types
  .model('Page')
  .props({
    entities: types.optional(types.array(types.reference(Any)), []),
    fetching: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
  })
  .views(self => ({
    get total() {
      return self.entities.length || 0;
    },
  }));

const Custom = types
  .model('Custom')
  .props({
    pageMap: types.optional(types.map(Page), {}),
    total: types.optional(Total, {}),
    fetching: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
    url: types.optional(types.string, '/'),
    params: types.optional(types.frozen, {}),
  })
  .views(self => {
    const pages = [];
    const entities = [];
    return {
      // Maps pageMap and returns an array of pages.
      get page() {
        self.pageMap.keys().forEach(key => {
          pages[key] = self.pageMap.get(key);
        });
        return pages;
      },
      // Maps page array and retuns an array of all entities
      get entities() {
        let index = 0;
        self.page.forEach(page => {
          page.entities.forEach(result => {
            entities[index] = result;
            index += 1;
          });
        });
        return entities;
      },
    };
  });

export { Custom, Page };
