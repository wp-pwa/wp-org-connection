import { types, getParent, getRoot, getType } from 'mobx-state-tree';

import Id from './id';
import Connection from '../';

const getConnection = node => {
  const root = getRoot(node);
  return getType(root) === Connection ? root : null;
};

export const List = types
  .model('List')
  .props({
    _id: Id,
    route: 'list',
    listType: types.optional(types.string, 'latest'),
    listId: types.optional(types.union(types.string, types.number), 'post'),
    page: types.optional(types.number, 1),
    visited: false,
  })
  .views(self => ({
    get ready() {
      return !!self.entity && self.entity.ready;
    },
    get list() {
      const { type, id, page } = self;
      const connection = getConnection(self);
      const list = connection && connection.list[type][id];
      return (list && list.page[page - 1]) || null;
    },
    get single() {
      const { type, id } = self;
      if (type === 'latest') return null;
      const connection = getConnection(self);
      return connection && connection.single[type][id];
    },
    get type() {
      return self.listType;
    },
    get id() {
      return self.listId;
    },
    get column() {
      try {
        return getParent(self, 2);
      } catch (e) {
        return null;
      }
    },
    get next() {
      let items;
      try {
        items = getParent(self);
      } catch (e) {
        return null;
      }
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
    fromList: types.optional(List, { listType: 'latest', listId: 'post' }),
    visited: false,
  })
  .views(self => ({
    get ready() {
      return !!self.entity && self.entity.ready;
    },
    get single() {
      const { type, id } = self;
      const connection = getConnection(self);
      return (connection && connection.single[type][id]) || null;
    },
    get type() {
      return self.singleType;
    },
    get id() {
      return self.singleId;
    },
    get column() {
      try {
        return getParent(self, 2);
      } catch (e) {
        return null;
      }
    },
    get next() {
      let items;
      try {
        items = getParent(self);
      } catch (e) {
        return null;
      }
      const index = items.indexOf(self);

      return index === items.length - 1
        ? self.column.next && self.column.next.items[0]
        : items[index + 1];
    },
  }));

export const Item = types.union(({ listType }) => (listType ? List : Single), List, Single);
