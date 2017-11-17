import { types } from 'mobx-state-tree';
import Column from './column';

export const Id = types.union(types.string, types.number);

export const List = types.model('List').props({
  id: types.identifier(Id),
  route: 'list',
  listType: types.optional(types.string, 'latest'),
  listId: types.optional(Id, 0),
  singleType: types.optional(types.string, 'post'),
  page: types.optional(types.number, 0),
  isReady: types.optional(types.boolean, false),
});

export const Single = types
  .model('Single')
  .props({
    id: types.identifier(Id),
    route: 'single',
    singleType: types.string,
    singleId: Id,
    isReady: types.optional(types.boolean, false),
    goBack: List,
    column: types.maybe(types.reference(types.late(() => Column))),
    next: types.maybe(types.reference(types.late(() => Item))), // eslint-disable-line
  });

export const Item = types.union(({ route }) => (route === 'list' ? List : Single), List, Single);
