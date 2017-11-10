import { types } from 'mobx-state-tree';
// import { ROUTE_CHANGE_SUCCEED } from '../types';

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

export const Single = types.model('Single').props({
  id: types.identifier(Id),
  route: 'single',
  singleType: types.string,
  singleId: Id,
  isReady: types.optional(types.boolean, false),
  goBack: List,
});

export const Item = types.union(({ route }) => (route === 'list' ? List : Single), List, Single);

export const Context = types
  .model('Context')
  .props({
    id: types.identifier(Id),
    options: types.frozen,
    selected: types.reference(Item),
    items: types.array(types.union(Item, types.array(Item))),
    infinite: true,
  })
  .views(self => ({
    findIndex: ({ listType, listId, page, singleType = 'post', singleId }) => {
      const hasSameProps = i =>
        (listType &&
          i.listType === listType &&
          i.listId === listId &&
          i.singleType === singleType &&
          i.page === page) ||
        (i.singleType === singleType && singleId && i.singleId === singleId);

      let y = 0;
      const x = self.items.findIndex(item => {
        if (item instanceof Array) {
          y = item.findIndex(hasSameProps);
          return y >= 0;
        }
        return hasSameProps(item);
      });

      return { x, y };
    },
  }));

export const Router = types
  .model('Router')
  .props({
    contexts: types.optional(types.array(Context), []),
    activeContext: types.optional(types.union(types.reference(Context), types.null), null),
  })
  .actions(self => ({
    // [ROUTE_CHANGE_SUCCEED]: ({ selected, method }) => {
    //   // const { listType, listId, page, singleType, singleId } = selected;
    //   const currentIndex = self.activeContext.findIndex(self.activeContext.selected);
    //   const newIndex = self.activeContext.findIndex(selected);
    //   const { x, y } = newIndex;
    //
    //   if (x === -1) return; // not found
    //
    //   const { items } = self.activeContext; // ?
    //   const selectedId = y === 0 ? items[x].id : items[x][y].id;
    //
    //   if (method === 'push') {
    //     self.activeContext.selected = selectedId;
    //   } else if (method === 'replace') {
    //     self.activeContext.selected = self.activeContext.items[x][y].id;
    //   }
    // },
    push: (context) => {

    },

    replace: (context) => {
      
    }
  }));
