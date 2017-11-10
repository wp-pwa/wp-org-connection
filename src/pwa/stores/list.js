import { types } from 'mobx-state-tree';
import { Single } from './single';

export const Total = types.model('Total').props({
  items: types.maybe(types.number),
  pages: types.maybe(types.number),
});

export const Page = types
  .model('Page')
  .props({
    items: types.optional(types.array(types.reference(Single)), []),
    fetching: types.optional(types.boolean, false),
  })
  .views(self => ({
    get isReady() {
      return self.items.length > 0;
    },
    get total() {
      return self.items.length || null;
    },
  }));

export const List = types
  .model('List')
  .props({
    page: types.array(Page),
    total: types.optional(Total, {}),
  })
  .views(self => {
    const items = [];
    return {
      get items() {
        let index = 0;
        self.page.forEach(page => {
          page.items.forEach(result => {
            items[index] = result;
            index += 1;
          });
        });
        return items;
      },
      get isReady() {
        return self.items.length > 0;
      },
    };
  });
