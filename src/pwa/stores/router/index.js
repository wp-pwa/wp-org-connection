import { types, detach } from 'mobx-state-tree';
import { isEqual } from 'lodash';
import Context from './context';
import Column from './column';
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

// const columnSnapshot = element => {
//   const elements = element instanceof Array ? element : [element];
//   const items = elements.map(({ _id, ...rest }) => ({ _id: _id || uuid(), ...rest }));
//   return { _id: uuid(), selected: items[0]._id, items };
// };

export const extractList = ({ listType, listId, page, result }, context) => {
  const listToExtract = ({ selected: { singleId, fromList } }) =>
    singleId === null &&
    fromList &&
    fromList.id === listId &&
    fromList.type === listType &&
    fromList.page === page;

  // Gets list's position inside context. Returns if there is not such list inside context
  const position = context.columns.findIndex(listToExtract);
  if (position === -1) return;

  // Obtains previous columns from position
  const firstColumns = context.columns.slice(0, position);

  // Removes from 'result' the ids of those items that are already contained
  // inside 'firstColumns'
  let elementsToPlace = result;
  firstColumns.forEach(col => {
    elementsToPlace = elementsToPlace.filter(
      id => !col.getItem({ singleId: id, singleType: 'post' }),
    );
  });

  // Generates an array of columns to be inserted into 'context.columns'
  const newColumns = elementsToPlace.map(id => {
    const item = context.getItem({ singleId: id, singleType: 'post' });

    // If item exist in context, moves the item...
    if (item) {
      item.fromList = { listType, listId, page };
      const { column } = item;

      // ... with its column, if it contains just that item, ...
      if (column.items.length === 1) {
        return detach(column);
      }

      // ... or to a new column, otherwise.
      if (column.selected === item) {
        // prevents 'column.selected' from pointing to an element in another column.
        const index = column.items.indexOf(item);
        if (index === 0) column.selected = column.items[index + 1];
        else column.selected = column.items[index - 1];
      }
      // WARNING - Scroll may be broken as selected has changed so beware!
      detach(item);
      return Column.create({ selected: item._id, items: [item] });
    }

    // If item does not exist in context, returns a new column with it.
    return Column.create(
      columnSnapshot({
        router: 'single',
        singleType: 'post',
        singleId: id,
        fromList: { listType, listId, page },
      }),
    );
  });

  // Reutilizes current column
  const { singleType, singleId } = newColumns[0].items[0];
  context.columns[position].items[0].singleType = singleType;
  context.columns[position].items[0].singleId = singleId;
  context.columns[position].selected = newColumns[0].selected;
  context.columns.splice(position + 1, 0, ...newColumns.slice(1));
};

export const actions = self => {
  const getExtractedColumns = (generated, list) => {
    const { listType, listId, page = 1 } = list;
    const listItem = self.list[listType][listId];
    const { entities, fetching } =
      listItem && listItem.page[page - 1] ? listItem.page[page - 1] : {};

    if (entities && !fetching) {
      return entities
        .filter(
          ({ type, id }) => !generated.some(col => col.getItem({ singleType: type, singleId: id })),
        )
        .map(({ type, id }) =>
          Column.create(
            columnSnapshot({
              router: 'single',
              singleType: type,
              singleId: id,
              fromList: list,
            }),
          ),
        );
    }

    // Returns an empty post with the list assigned in the fromList attribute.
    return [
      Column.create(
        columnSnapshot({
          router: 'single',
          singleType: 'post',
          fromList: list,
        }),
      ),
    ];
  };

  const extractListFromStore = (generated, list) =>
    generated.concat(getExtractedColumns(generated, list));

  const loadNextPageIfInfinite = () => {
    if (self.context.infinite) {
      const { column, fromList } = self.context.selected;
      const { columns } = self.context;

      if (column.index >= columns.length - 2 && fromList) {
        const nextList = {
          listType: fromList.type,
          listId: fromList.id,
          page: fromList.page + 1,
        };

        getExtractedColumns(self.context.columns, nextList).forEach(col =>
          self.context.columns.push(col),
        );
      }
    }
  };

  const addNewContext = () => {
    const index = self.selectedContext ? self.selectedContext.index + 1 : 0;
    self.contexts[index] = { index };
    return self.contexts[index];
  };

  const changeSelectedItem = ({ selectedItem }) => {
    const newItem = self.selectedContext.getItem(selectedItem);
    if (!newItem)
      throw new Error("You are trying to select an item in a context where doesn't exist");
    newItem.parentColumn.selectedItem = newItem;
    self.selectedContext.selectedColumn = newItem.parentColumn;
    self.selectedItem.visited = true;
    // loadNextPageIfInfinite();
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
    contextInstance.setGenerator(context);
    contextInstance.addColumns(context.columns);
    contextInstance.addItemIfMissing(selectedItem, true);
    self.selectedContext = contextInstance;
    changeSelectedItem({ selectedItem });
  };

  const replaceSelectedContext = ({ selectedItem, context }) => {
    const contextInstance = self.selectedContext;
    contextInstance.setGenerator(context);
    contextInstance.replaceColumns(context.columns);
    contextInstance.addItemIfMissing(selectedItem, true);
    self.selectedContext = contextInstance;
    changeSelectedItem({ selectedItem });
  };

  const moveItemToSelectedColumn = ({ item }) => {
    const newItem = self.selectedContext.getItem(item);
    if (!newItem) throw new Error("Can't move if selected doesn't exist in the previous context.");
    if (newItem.parentColumn !== self.selectedContext.parentColumn) {
      self.selectedContext.moveItem(item);
    }
    // loadNextPageIfInfinite();
  };

  return {
    [actionTypes.ROUTE_CHANGE_SUCCEED]: ({ selectedItem, method, context: actionContext }) => {
      if (typeof window !== 'undefined')
        self.siteInfo.headContent = self.siteInfo.headContent.filter(node => node.permanent);

      let context = actionContext || { columns: [[{ ...selectedItem }]] };
      // If there's not a previous context.
      if (!self.selectedContext) return createNewContext({ selectedItem, context });
      // If there's a previous context...
      const selectedItemInSelectedContext = self.selectedContext.hasItem(selectedItem);
      if (!actionContext && selectedItemInSelectedContext) context = self.selectedContext.generator;
      const generatorsAreEqual = isEqual(self.selectedContext.generator, context);

      if (generatorsAreEqual && selectedItemInSelectedContext)
        return changeSelectedItem({ selectedItem });
      if (method === 'push') return createNewContext({ selectedItem, context });
      if (method === 'replaceContext') return replaceSelectedContext({ selectedItem, context });
      if (method === 'selectItemInPreviousContext')
        return selectItemInPreviousContext({ selectedItem });
      if (method === 'selectItemInNextContext') return selectItemInNextContext({ selectedItem });
      throw new Error('Connection didn\'t know what to do. Please search this error in the code.');
    },
    [actionTypes.MOVE_ITEM_TO_COLUMN]: ({ item }) => {
      moveItemToSelectedColumn({ item });
    },
  };
};
