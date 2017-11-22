import { types, getParent } from 'mobx-state-tree';

import Id from './id';

export const List = types
  .model('List')
  .props({
    _id: Id,
    route: 'list',
    listType: types.optional(types.string, 'latest'),
    listId: types.maybe(types.union(types.string, types.number)),
    page: types.optional(types.number, 1),
    ready: types.optional(types.boolean, false),
    // next: types.maybe(types.reference(types.late(() => Item))), // eslint-disable-line
  })
  .views(self => ({
    get type() {
      return self.listType;
    },
    get id() {
      return self.listId;
    },
    get column() {
      return getParent(self, 2);
    },
    get next() {
      const items = getParent(self);
      const index = items.indexOf(self);

      return index === items.length - 1
        ? self.column.next && self.column.next.items[0]
        : items[index + 1];
    },
  }));

export const Single = types
  .model('Single')
  .props({
    _id: Id,
    route: 'single',
    singleType: types.string,
    singleId: types.maybe(types.number),
    ready: types.optional(types.boolean, false),
    fromList: types.maybe(List),
    // next: types.maybe(types.reference(types.late(() => Item))), // eslint-disable-line
  })
  .views(self => ({
    get type() {
      return self.singleType;
    },
    get id() {
      return self.singleId;
    },
    get column() {
      return getParent(self, 2);
    },
    get next() {
      const items = getParent(self);
      const index = items.indexOf(self);

      return index === items.length - 1
        ? self.column.next && self.column.next.items[0]
        : items[index + 1];
    },
  }));

export const Item = types.union(({ listType }) => (listType ? List : Single), List, Single);
