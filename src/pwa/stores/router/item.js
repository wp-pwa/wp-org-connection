import { types, getParent, getType } from 'mobx-state-tree';

import Id from './id';
import Connection from '../'

const getConnection = element => {
  let connection = element;
  while (getType(connection) !== Connection) connection = getParent(connection);
  return connection;
}

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
    get list() {
      const { type, id, page } = self;
      const list = getConnection(self).list[type][id];
      return list && list.page[page - 1] || null;
    },
    get single() {
      const { type, id } = self;
      if (type === 'latest') return null;
      return getConnection(self).single[type][id]
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
    get single() {
      const { type, id } = self;
      return getConnection(self).single[type][id] || null;
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
