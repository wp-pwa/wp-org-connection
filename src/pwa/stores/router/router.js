import { types, detach } from 'mobx-state-tree';
import uuid from 'uuid/v4';
import { Column } from './column';
import { Context } from './context';

import { ROUTE_CHANGE_SUCCEED } from '../../actionTypes';

const Router = types
  .model('Router')
  .props({
    contexts: types.optional(types.array(Context), []),
    context: types.optional(types.union(types.reference(Context), types.null), null),
  })
  .actions(self => ({
    [ROUTE_CHANGE_SUCCEED]: ({ selected, method, context }) => self[method]({ selected, context }),

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
      if (item) self.context.selected = item;
      else {
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
  }));

export default Router;
