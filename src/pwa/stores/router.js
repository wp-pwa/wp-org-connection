import { types } from 'mobx-state-tree';
import { ROUTE_CHANGE_SUCCEED } from '../types';

export const generateId = () =>
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
    findIndex: ({ listType, listId, page, singleType, singleId }) => {
      const hasSameProps = i =>
        (!listType || listType === i.listType) &&
        (!listId || listId === i.listId) &&
        (!page || page === i.page) &&
        (!singleType || singleType === i.singleType) &&
        (!singleId || singleId === i.singleId);

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
    getPrevious: () => {
      const { x } = self.findIndex(self.selected);
      return x > 0 ? self.items[x - 1] : null;
    },
    getCurrent: () => {
      const { x } = self.findIndex(self.selected);
      return x !== -1 ? self.items[x] : null;
    },
    getNext: () => {
      const { x } = self.findIndex(self.selected);
      const nextToLast = self.items.length - 1;
      return x !== -1 && x < nextToLast ? self.items[x + 1] : null;
    },
  }))
  .actions(self => ({
    setSelected: ({ x, y }) => {
      const item = self.items[x];
      self.selected = item instanceof Array ? item[y] : item;
    },
  }));

export const Router = types
  .model('Router')
  .props({
    contexts: types.optional(types.array(Context), []),
    activeContext: types.optional(types.union(types.reference(Context), types.null), null),
  })
  .actions(self => ({
    [ROUTE_CHANGE_SUCCEED]: ({ selected, method, context }) => self[method]({ selected, context }),

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
        // const itemId = generateId();
        const item = selected; // { id: itemId, ...selected };
        const length = self.contexts.push({
          id: contextId,
          selected: item.id,
          items: [item],
        });

        self.activeContext = self.contexts[length - 1];
      }
    },

    replace: ({ selected, context }) => {
      // Replaces the context if a new one is passed.
      if (context) {
        const index = self.contexts.findIndex(ctx => self.activeContext.id === ctx.id);
        self.contexts.splice(index, 1, context);
        self.activeContext = self.contexts[index];
      }

      if (!selected) return;

      // Ensures that 'selected' exists inside 'activeContext'
      // and assigns to it.
      const { x, y } = self.activeContext.findIndex(selected);
      if (x !== -1) {

        console.log('replace', { x, y });

        const [item] =
          y > 0 ? self.activeContext.items[x].splice(y, 1) : self.activeContext.items.splice(x, 1);

        // Current index
        const currentIndex = self.activeContext.findIndex(self.activeContext.selected);
        const current = self.activeContext.getCurrent();
        if (current instanceof Array) {
          if (currentIndex.x === x) {
            // without changes
            self.activeContext.selected = item;
          } else {
            // move item to current
            current.splice(currentIndex.y, 0, item);
          }
        } else {
          self.activeContext.items[current.x] = [current, item];
        }
      }
    },
  }));
