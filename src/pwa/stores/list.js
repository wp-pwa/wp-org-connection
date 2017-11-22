import { types, getParent } from 'mobx-state-tree';
import { Post } from './single';

export const Total = types.model('Total').props({
  entities: types.maybe(types.number),
  pages: types.maybe(types.number),
}).views(self => ({
  get fetched() {
    return getParent(self).entities.length || 0;
  }
}));

export const Page = types
  .model('Page')
  .props({
    entities: types.optional(types.array(types.reference(Post)), []),
    fetching: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
  })
  .views(self => ({
    get total() {
      return self.entities.length || 0;
    },
  }));

export const List = types
  .model('List')
  .props({
    pageMap: types.optional(types.map(Page), {}),
    total: types.optional(Total, {}),
    fetching: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
  })
  .views(self => {
    const entities = [];
    const pages = [];
    return {
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
