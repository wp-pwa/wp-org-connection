import { types } from 'mobx-state-tree';
import { Single } from './single';

export const Total = types.model('Total').props({
  items: types.maybe(types.number),
  pages: types.maybe(types.number),
});

export const Page = types
  .model('Page')
  .props({
    entities: types.optional(types.array(types.reference(Single)), []),
    fetching: types.optional(types.boolean, false),
  })
  .views(self => ({
    get isReady() {
      return self.entities.length > 0;
    },
    get total() {
      return self.entities.length || null;
    },
  }));

export const List = types
  .model('List')
  .props({
    page: types.array(Page),
    total: types.optional(Total, {}),
  })
  .views(self => {
    const entities = [];
    return {
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
      get isReady() {
        return self.entities.length > 0;
      },
    };
  });
