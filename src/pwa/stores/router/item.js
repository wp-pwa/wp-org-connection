import { types } from 'mobx-state-tree';
import Column from './column';

import Id from '../id';

export const List = types.model('List').props({
  _id: Id,
  route: 'list',
  listType: types.optional(types.string, 'latest'),
  listId: types.maybe(types.union(types.string, types.number)),
  page: types.optional(types.number, 1),
  ready: types.optional(types.boolean, false),
  column: types.maybe(types.reference(types.late(() => Column))),
  next: types.maybe(types.reference(types.late(() => Item))), // eslint-disable-line
}).views(self => ({
  get type() {
    return self.listType;
  },
  get id() {
    return self.listId;
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
    column: types.maybe(types.reference(types.late(() => Column))),
    next: types.maybe(types.reference(types.late(() => Item))), // eslint-disable-line
  }).views(self => ({
    get type() {
      return self.singleType;
    },
    get id() {
      return self.singleId;
    },
  }));

export const Item = types.union(({ listType }) => (listType ? List : Single), List, Single);
