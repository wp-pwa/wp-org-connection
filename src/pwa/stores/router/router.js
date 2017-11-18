import { types, detach } from 'mobx-state-tree';
import uuid from 'uuid/v4';
import Column from './column';
import Context from './context';

import * as actionTypes from '../../actionTypes';

const lateContext = types.late(() => Context);

const Router = types
  .model('Router')
  .props({
    contexts: types.optional(types.array(lateContext), []),
    context: types.maybe(types.reference(lateContext)),
  })
  .views(self => ({
    get selected() {
      return self.context.selected;
    },
  }))
  .actions(self => {
    const createNewContext = () => {};

    const createContextFromSelected = ({ listType, listId, singleType, singleId, page }) => {
      const contextIndex = self.context ? self.context.index + 1 : 0;
      const columnId = uuid();
      const itemId = uuid();
      const items = [{ _id: itemId, column: columnId }];
      if (listType) items[0] = { ...items[0], route: 'list', listType, listId, page };
      else items[0] = { ...items[0], route: 'single', singleType, singleId };
      self.contexts.push({
        index: contextIndex,
        column: columnId,
        columns: [{ _id: columnId, items, selected: itemId }],
      });

      self.context = contextIndex;
    };

    return {
      // [actionTypes.ROUTE_CHANGE_REQUESTED]: ({
      //   selected: { listType, listId, page, singleType, singleId },
      //   method,
      //   context,
      // }) => {},
      [actionTypes.ROUTE_CHANGE_SUCCEED]: ({ selected, method, context }) => {
        if (context === null) {
          if (self.context === null || !self.context.getItem(selected))
            createContextFromSelected(selected);
        }
      },

      // addContext: context => {
      //   // items.
      // },

      push: ({ selected, context }) => {
        // Creates a context if a new one is passed.
        if (context) {
          const index = self.contexts.push(context);
          self.context = self.contexts[index];
        }

        // Ensures that 'selected' exists inside 'activeContext'
        // and assigns to it.
        const item = self.context.getItem(selected);
        if (item) {
          self.context.column = item.column;
          self.context.column.selected = item;
        } else {
          // If 'selected' doesn't exist inside 'activeContext', then a new context
          // should be created with that item.
          const contextId = uuid();
          const column = Column.create([selected]);
          const length = self.contexts.push({
            id: contextId,
            selected: column,
            columns: [column],
          });

          self.context = self.contexts[length - 1];
        }
      },

      replace: ({ selected, context }) => {
        // Replaces the context if a new one is passed.
        if (context) {
          const index = self.contexts.findIndex(ctx => self.activeContext.id === ctx.id);
          self.contexts.splice(index, 1, context);
          self.context = self.contexts[index];
        }

        if (!selected) return;

        // Ensures that 'selected' exists inside 'context'
        const item = self.context.getItem(selected);
        if (item) {
          const column = self.context.selected;
          // item is not in the selected column.
          if (!column.getItem(selected)) {
            detach(item);
            const index = column.items.findIndex(column.selected);
            column.items.splice(index + 1, 0, item);
          }
          column.selected = item;
        }
      },
    };
  });

export default Router;
