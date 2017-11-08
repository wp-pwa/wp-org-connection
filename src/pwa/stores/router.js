import { types } from 'mobx-state-tree';

export const Id = types.union(types.string, types.number);

export const List = types.model('List').props({
  route: 'list',
  listType: types.optional(types.string, 'latest'),
  listId: types.optional(Id, 0),
  singleType: types.optional(types.string, 'post'),
  page: types.optional(types.number, 0),
  isReady: types.optional(types.boolean, false),
  // goBack: types.reference(Context),
});

export const Single = types.model('Single').props({
  route: 'single',
  singleType: types.string,
  singleId: Id,
  isReady: types.optional(types.boolean, false),
  // goBack: types.reference(Context),
});

export const Item = types.union(List, Single);

export const Context = types.model('Context').props({
  options: types.frozen,
  selected: types.reference(Item),
  items: types.array(types.union(Item, types.array(Item))),
  infinite: true,
  // overwrite: false, --> this property might be used only when calling an action...
});
export const Router = types.model('Router').props({
  contexts: types.optional(types.array(Context), []),
  activeContext: types.optional(types.union(types.reference(Context), types.null), null),
  selected: types.optional(types.union(types.reference(Item), types.null), null),
});

// Item
