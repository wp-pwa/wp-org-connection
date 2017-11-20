import { types } from 'mobx-state-tree';
import { Any } from './single';
import { Total } from './list';

export const Page = types
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
  })
  .views(self => {
    const pages = [];
    const entities = [];
    return {
      // Maps over pageMap and returns an array of ids
      get page() {
        self.pageMap.keys().forEach(page => {
          pages[page] = self.pageMap.get(page);
        });
        return pages;
      },
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

export { Custom };
