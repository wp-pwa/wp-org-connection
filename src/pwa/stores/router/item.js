import { types, getParent, getRoot } from 'mobx-state-tree';

import Id from './id';

export const List = types
  .model('List')
  .props({
    _id: Id,
    route: 'list',
    listType: types.optional(types.string, 'latest'),
    listId: types.optional(types.union(types.string, types.number), 'post'),
    page: types.optional(types.number, 1),
  })
  .views(self => ({
    get ready() {
      return !!self.entity && self.entity.ready;
    },
    get entity() {
      const { type, id, page } = self;
      const list = getRoot(self).list[type][id];
      return list && list.page[page] || null;
    },
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
    fromList: types.maybe(List),
  })
  .views(self => ({
    get ready() {
      return !!self.entity && self.entity.ready;
    },
    get entity() {
      const { type, id } = self;
      return getRoot(self).single[type][id] || null;
    },
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
