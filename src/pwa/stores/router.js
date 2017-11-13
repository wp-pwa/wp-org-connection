import { types } from 'mobx-state-tree';
import { ROUTE_CHANGE_SUCCEED } from '../types';

const generateId = () =>
  Math.random()
    .toString(16)
    .slice(2);

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
    previous: () => {
      const { x } = self.findIndex(self.selected);
      return x !== -1 ? self.items[x - 1] : null;
    },
    current: () => {
      const { x } = self.findIndex(self.selected);
      return x !== -1 ? self.items[x] : null;
    },
    next: () => {
      const { x } = self.findIndex(self.selected);
      return x !== -1 ? self.items[x + 1] : null;
    },
  }))
  .actions(self => ({
    setSelected: ({ x, y }) => {
      self.selected = y > 0 ? self.items[x][y] : self.items[x];
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
    // [ROUTE_CHANGE_SUCCEED]: ({ selected, method, context }) => self[method]({ selected, context }),
    //
    push: ({ selected, context }) => {
      // Creates a context if a new one is passed.
      if (context) {
        const index = self.contexts.push(context);
        self.activeContext = self.contexts[index];
      }

      // Ensures that 'selected' exists inside 'activeContext'
      // and assigns to it.
      const { x, y } = self.activeContext.findIndex(selected);
      if (x !== -1) self.activeContext.setSelected({ x, y });
      else {
        // If 'selected' doesn't exist inside 'activeContext', then a new context
        // should be created with that item.
        const contextId = generateId();
        const itemId = generateId();
        const item = { id: itemId, ...selected };
        const index = self.contexts.push({
          contextId,
          selected: itemId,
          items: [item],
        });

        self.activeContext = self.contexts[index];
      }
    },
    //
    // replace: ({ selected, context }) => {
    //   // Replaces the context if a new one is passed.
    //   if (context) {
    //     const index = self.contexts.findIndex(ctx => self.activeContext === ctx.id);
    //     self.contexts.splice(index, 1, context);
    //     self.activeContext = context.id ? context.id : (context.id = generateId());
    //   }
    //
    //   // Ensures that 'selected' exists inside 'activeContext'
    //   // and assigns to it.
    //   const { x, y } = self.activeContext.findIndex(selected);
    //   if (x !== -1) {
    //     const [ item ] =
    //       y > 0 ? self.activeContext.items[x].splice(y, 1) : self.activeContext.items.splice(x, 1);
    //
    //     // Current index
    //     const currentIndex = self.activeContext.findIndex()
    //   }
    // }
  }));
