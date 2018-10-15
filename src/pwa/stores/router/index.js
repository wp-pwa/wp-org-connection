import { types } from 'mobx-state-tree';
import { isEqual } from 'lodash-es';
import Context from './context';

const lateContext = types.late(() => Context);

export const props = {
  contexts: types.array(lateContext),
  selectedContext: types.maybe(types.reference(lateContext)),
};

export const views = self => ({
  get selectedColumn() {
    return self.selectedContext && self.selectedContext.selectedColumn;
  },
  get selectedItem() {
    return (
      self.selectedContext &&
      self.selectedContext.selectedColumn &&
      self.selectedContext.selectedColumn.selectedItem
    );
  },
});

export const actions = self => {
  const addNewContext = () => {
    const index = self.selectedContext ? self.selectedContext.index + 1 : 0;
    self.contexts[index] = { index };
    return self.contexts[index];
  };

  const changeSelectedItem = ({ selectedItem }) => {
    const newItem = self.selectedContext.getItem({ item: selectedItem });
    if (!newItem) {
      throw new Error(
        "You are trying to select an item in a context where doesn't exist",
      );
    }
    newItem.parentColumn.selectedItem = newItem;
    self.selectedContext.selectedColumn = newItem.parentColumn;
    self.selectedItem.hasBeenVisited = true;
  };

  const selectItemInPreviousContext = ({ selectedItem }) => {
    self.selectedContext = self.contexts[self.selectedContext.index - 1];
    changeSelectedItem({ selectedItem });
  };

  const selectItemInNextContext = ({ selectedItem }) => {
    self.selectedContext = self.contexts[self.selectedContext.index + 1];
    changeSelectedItem({ selectedItem });
  };

  const createNewContext = ({ selectedItem, context, generator }) => {
    const contextInstance = addNewContext();
    contextInstance.setGenerator({ generator });
    contextInstance.setOptions({ options: context.options });
    contextInstance.addColumns({ columns: context.columns });
    contextInstance.addItemIfMissing({ item: selectedItem, index: 0 });
    self.selectedContext = contextInstance;
    changeSelectedItem({ selectedItem });
  };

  const replaceSelectedContext = ({ context, generator }) => {
    const contextInstance = self.selectedContext;
    contextInstance.setGenerator({ generator });
    contextInstance.replaceColumns({ columns: context.columns });
    self.selectedContext = contextInstance;
  };

  const moveItemToSelectedColumn = ({ item }) => {
    const newItem = self.selectedContext.getItem({ item });
    if (!newItem)
      throw new Error(
        "Can't move if selected doesn't exist in the previous context.",
      );
    if (newItem.parentColumn !== self.selectedItem.parentColumn) {
      self.selectedContext.moveItem({ item });
    }
    newItem.hasBeenVisited = true;
  };

  const addItemToSelectedColumn = ({ item }) => {
    self.selectedContext.selectedColumn.addItem({ item });
  };

  const extractItemsInContext = ({ context }) => {
    const columns = [];
    context.columns.forEach(column => {
      if (!Array.isArray(column))
        throw new Error('Columns should be arrays and not single objects.');
      const { type, id, page, extract } = column[0];
      if (extract === 'horizontal' && self.list(type, id).page(page).isReady) {
        const items = self
          .list(type, id)
          .page(page)
          .entities.map(entity => [
            {
              type: entity.type,
              id: entity.id,
              fromList: { type, id, page },
            },
          ]);
        columns.push(...items);
      } else {
        columns.push(column);
      }
    });
    return { ...context, columns };
  };

  return {
    routeChangeSucceed: ({ selectedItem, method, context: actionContext }) => {
      // Initialize generator and context.
      let generator = actionContext || { columns: [[{ ...selectedItem }]] };
      const context = extractItemsInContext({
        context: actionContext || { columns: [[{ ...selectedItem }]] },
      });

      if (!self.selectedContext) {
        // If there's not a previous context we create one.
        createNewContext({ selectedItem, context, generator });
      } else {
        // If there's a previous context...
        // First, get some info:
        const itemInSelectedContext = self.selectedContext.hasItem({
          item: selectedItem,
        });
        if (!actionContext && itemInSelectedContext) {
          generator = self.selectedContext.generator; // eslint-disable-line
        }
        const generatorsAreEqual = isEqual(
          self.selectedContext.generator,
          generator,
        );

        // Then check conditions:
        // If we are in the same context and we just want to change the selected.
        if (generatorsAreEqual && itemInSelectedContext)
          changeSelectedItem({ selectedItem });
        // If we are going backward or forward in the history
        else if (method === 'backward')
          selectItemInPreviousContext({ selectedItem });
        else if (method === 'forward')
          selectItemInNextContext({ selectedItem });
        // If nothing of the previous, we just create a new context
        else createNewContext({ selectedItem, context, generator });
      }
    },
    moveItemToColumn: ({ item }) => {
      moveItemToSelectedColumn({ item });
    },
    addItemToColumn: ({ item }) => {
      addItemToSelectedColumn({ item });
    },
    addColumnToContext: ({ column }) => {
      self.selectedContext.addColumn({ column });
    },
    replaceContext: ({ context }) => {
      replaceSelectedContext({
        context: extractItemsInContext({ context }),
        generator: context,
      });
    },
  };
};
