import { types, detach } from 'mobx-state-tree';
import { isEqual } from 'lodash';
import uuid from 'uuid/v4';
import Column from './column';
import Context from './context';
import * as actionTypes from '../../actionTypes';
import { init } from '../connection';

const lateContext = types.late(() => Context);

export const props = {
  contexts: types.optional(types.array(lateContext), []),
  context: types.maybe(types.reference(lateContext)),
};

export const views = self => ({
  get selected() {
    return self.context && self.context.selected;
  },
});

const columnSnapshot = element => {
  const elements = element instanceof Array ? element : [element];
  const items = elements.map(({ _id, ...rest }) => ({ _id: _id || uuid(), ...rest }));
  return { _id: uuid(), selected: items[0]._id, items };
};

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
  const shouldInit = ({ listType, listId, singleType, singleId }) => {
    if (listType) {
      const list = self.listMap.get(listType) && self.listMap.get(listType).get(listId);
      const single = self.singleMap.get(listType) && self.singleMap.get(listType).get(listId);
      if (list && single) return false;
    }

    if (singleType && singleId) {
      const single = self.singleMap.get(singleType) && self.singleMap.get(singleType).get(singleId);
      if (single) return false;
    }

    if (singleType && !singleId) return false;

    return true;
  };

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

  const changeSelected = selected => {
    const selectedItem = self.context.getItem(selected);
    if (selectedItem) {
      const { column, fromList } = selectedItem;
      column.selected = selectedItem;
      self.context.column = column;

      if (self.context.infinite) {
        const { columns } = self.context;

        if (columns.indexOf(column) >= columns.length - 1 && fromList) {
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
    } else {
      // Creates a new element at first position
      const newColumn = Column.create(columnSnapshot(selected));
      self.context.columns.unshift(newColumn);
      self.context.column = newColumn;
    }
  };

  const moveSelected = selected => {
    const selectedItem = self.context.getItem(selected);
    const current = self.context.selected;

    if (selectedItem && current.column._id !== selectedItem.column._id) {
      const { column } = selectedItem;
      detach(selectedItem);

      if (column.items.length === 0) detach(column);

      current.column.items.push(selectedItem);
      selectedItem.column.selected = selectedItem;
    }
  };

  const createContext = (selected, generator, contextIndex) => {
    const { items, options, infinite } = generator;
    const columns = items.reduce((generated, element) => {
      if (element.listType && element.extract) {
        generated = extractListFromStore(generated, element);
      } else {
        generated.push(Column.create(columnSnapshot(element)));
      }
      return generated;
    }, []);

    // Adds selected if columns is empty
    if (columns.length === 0) columns.push(Column.create(columnSnapshot(selected)));

    return {
      index: contextIndex,
      column: columns[0]._id,
      columns,
      options,
      infinite,
      generator,
    };
  };

  const pushContext = (selected, context) => {
    const contextIndex = self.context ? self.context.index + 1 : 0;
    self.contexts[contextIndex] = createContext(selected, context, contextIndex);
    self.context = self.contexts[contextIndex];
    changeSelected(selected);
  };

  const replaceContext = (selected, context) => {
    const contextIndex = self.context ? self.context.index : 0;
    const ctx = self.context;
    detach(ctx);
    self.contexts[contextIndex] = createContext(selected, context, contextIndex);
    self.context = self.contexts[contextIndex];
    changeSelected(selected);
  };

  const changeToContext = (selected, relativeIndex) => {
    const newIndex = self.context.index + relativeIndex;
    self.context = self.contexts[newIndex];
    changeSelected(selected);
  };

  const selectInPreviousContext = selected => changeToContext(selected, -1);
  const selectInNextContext = selected => changeToContext(selected, 1);

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
    [actionTypes.ROUTE_CHANGE_REQUESTED]: ({ selected, context }) => {
      if (shouldInit(selected)) init({ self, ...selected, fetching: false });

      if (context) {
        context.items.forEach(column => {
          if (column instanceof Array) {
            column.forEach(item => {
              const { fromList } = item;
              if (shouldInit(item)) init({ self, ...item, fetching: false });
              if (fromList && shouldInit(fromList)) init({ self, ...fromList, fetching: false });
            });
          } else {
            const { fromList } = column;
            if (shouldInit(column)) init({ self, ...column, fetching: false });
            if (fromList && shouldInit(fromList)) init({ self, ...fromList, fetching: false });
          }
        });
      }
    },
    [actionTypes.ROUTE_CHANGE_SUCCEED]: ({ selected, method, context }) => {
      const selectedInContext = self.context && !!self.context.getItem(selected);
      const contextsAreEqual = self.context && isEqual(self.context.generator, context);

      if (self.context) {
        if (selectedInContext && ((context && contextsAreEqual) || !context)) {
          if (['push', 'back', 'forward'].includes(method)) changeSelected(selected);
          if (method === 'replace') moveSelected(selected);
        }
        if (context && !contextsAreEqual) {
          if (method === 'push') pushContext(selected, context);
          if (method === 'replace') replaceContext(selected, context);
          if (method === 'back') selectInPreviousContext(selected);
          if (method === 'forward') selectInNextContext(selected);
        }
        if (!context && !selectedInContext) {
          if (method === 'back') selectInPreviousContext(selected);
          if (method === 'forward') selectInNextContext(selected);
          if (['push', 'replace'].includes(method)) createContextFromSelected(selected);
        }
      } else if (context) {
        pushContext(selected, context);
      } else {
        createContextFromSelected(selected);
      }
    },
  };
};
