import { types } from 'mobx-state-tree';
import { isEqual } from 'lodash';
import Context from './context';
import * as actionTypes from '../../actionTypes';

const lateContext = types.late(() => Context);

export const props = {
  contexts: types.optional(types.array(lateContext), []),
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
      throw new Error("You are trying to select an item in a context where doesn't exist");
    }
    newItem.parentColumn.selectedItem = newItem;
    self.selectedContext.selectedColumn = newItem.parentColumn;
    self.selectedItem.visited = true;
  };

  const selectItemInPreviousContext = ({ selectedItem }) => {
    self.selectedContext = self.contexts[self.selectedContext.index - 1];
    changeSelectedItem({ selectedItem });
  };

  const selectItemInNextContext = ({ selectedItem }) => {
    self.selectedContext = self.contexts[self.selectedContext.index + 1];
    changeSelectedItem({ selectedItem });
  };

  const createNewContext = ({ selectedItem, context }) => {
    const contextInstance = addNewContext();
    contextInstance.setGenerator({ generator: context });
    contextInstance.setOptions({ options: context.options });
    contextInstance.addColumns({ columns: context.columns });
    contextInstance.addItemIfMissing({ item: selectedItem, index: 0 });
    self.selectedContext = contextInstance;
    changeSelectedItem({ selectedItem });
  };

  const replaceSelectedContext = ({ context }) => {
    const contextInstance = self.selectedContext;
    contextInstance.setGenerator({ generator: context });
    contextInstance.replaceColumns({ columns: context.columns });
    self.selectedContext = contextInstance;
  };

  const moveItemToSelectedColumn = ({ item }) => {
    const newItem = self.selectedContext.getItem({ item });
    if (!newItem) throw new Error("Can't move if selected doesn't exist in the previous context.");
    if (newItem.parentColumn !== self.selectedContext.parentColumn) {
      self.selectedContext.moveItem({ item });
    }
  };

  const addItemToSelectedColumn = ({ item }) => {
    self.selectedContext.selectedColumn.addItem({ item });
  };

  return {
    [actionTypes.ROUTE_CHANGE_SUCCEED]: ({ selectedItem, method, context: actionContext }) => {
      if (typeof window !== 'undefined')
        self.siteInfo.headContent = self.siteInfo.headContent.filter(node => node.permanent);

      // Initialize context.
      let context = actionContext || { columns: [[{ ...selectedItem }]] };

      if (!self.selectedContext) {
        // If there's not a previous context we create one.
        createNewContext({ selectedItem, context });
      } else {
        // If there's a previous context...
        // First, get some info:
        const itemInSelectedContext = self.selectedContext.hasItem({ item: selectedItem });
        if (!actionContext && itemInSelectedContext) context = self.selectedContext.generator;
        const generatorsAreEqual = isEqual(self.selectedContext.generator, context);

        // Then check conditions:
        // If we are in the same context and we just want to change the selected.
        if (generatorsAreEqual && itemInSelectedContext) changeSelectedItem({ selectedItem });
        else if (method === 'backward')
          // If we are going backward or forward in the history
          selectItemInPreviousContext({ selectedItem });
        else if (method === 'forward') selectItemInNextContext({ selectedItem });
        else
          // If nothing of the previous, we just create a new context
          createNewContext({ selectedItem, context });
      }
    },
    [actionTypes.MOVE_ITEM_TO_COLUMN]: ({ item }) => {
      moveItemToSelectedColumn({ item });
    },
    [actionTypes.ADD_ITEM_TO_COLUMN]: ({ item }) => {
      addItemToSelectedColumn({ item });
    },
    [actionTypes.REPLACE_CONTEXT]: ({ context }) => {
      replaceSelectedContext({ context });
    },
  };
};
