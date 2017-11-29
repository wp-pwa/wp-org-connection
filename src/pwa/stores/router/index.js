import { types, detach, getParent } from 'mobx-state-tree';
import { when } from 'mobx';
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

export const actions = self => {
  const changeSelected = selected => {
    const selectedItem = self.context.getItem(selected);
    if (selectedItem) {
      const { column } = selectedItem;
      column.selected = selectedItem;
      self.context.column = column;
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

  const columnSnapshot = element => {
    const elements = element instanceof Array ? element : [element];
    const items = elements.map(({ _id, ...rest }) => ({ _id: _id || uuid(), ...rest }));
    return { _id: uuid(), selected: items[0]._id, items };
  };

  // const populateWhenReady = ({ listType, listId, page = 1 }) => {
  //   when(
  //     () => self.list[listType][listId].page[page - 1],
  //     // self.list[listType][listId].page[page - 1] &&
  //     // self.list[listType][listId].page[page - 1].ready,
  //     () => {
  //       console.log('populateWhenReady', { listType, listId, page });
  //     },
  //   );
  // };

  const extractList = ({ listType, listId, page, result }, context) => {
    // [...self.context.items]
    //   .filter(
    //     ({ fromList }) =>
    //       fromList &&
    //       fromList.id === listId &&
    //       fromList.type === listType &&
    //       fromList.page === page,
    //   )
    //   .forEach((item, i) => {
    //     item.singleType = entities.post[result[i]].type;
    //     item.singleId = entities.post[result[i]].id;
    //   });

    const listToExtract = ({ selected: { singleId, fromList } }) =>
      singleId === null &&
      fromList &&
      fromList.id === listId &&
      fromList.type === listType &&
      fromList.page === page;

    const position = context.columns.findIndex(listToExtract);

    // Returns if there is not such list inside context
    if (position === -1) return;


    // 1. filtrar columns y obtener las de índice menor que position (usar slice)
    const firstColumns = context.columns.slice(0, position);
    let elementsToPlace = result;
    // 2. en cada columna, buscar los elementos que hay en elementsToPlace (usar getItem)
    firstColumns.forEach(col => {
      // 3. el elemento que se encuentre se borra de elementsToPlace
      elementsToPlace = elementsToPlace.filter(
        id => !col.getItem({ singleId: id, singleType: 'post' }),
      );
    });

    // 4. los elementos que queden, se buscan en el contexto (usar getItem)
    const newColumns = elementsToPlace.map(id => {
      const item = context.getItem({ singleId: id, singleType: 'post' });
      if (item) {
        // 6. si se encuentran, se mueven (modificar moveSelected ?)
        const { column } = item;

        if (column.items.length === 1) return detach(column);

        detach(item);
        return Column.create({ selected: item._id, items: [item] });
      }

      return Column.create(
        columnSnapshot({
          router: 'single',
          singleType: 'post',
          singleId: id,
          fromList: { listType, listId, page },
        }),
      );
    });

    context.columns.splice(position, 1, ...newColumns);
  };

  const getListFromStore = list => {
    const { listType, listId, page = 1 } = list;
    const listItem = self.list[listType][listId];
    const { entities } = listItem && listItem.page[page - 1] ? listItem.page[page - 1] : {};

    if (entities) {
      return entities.map(e =>
        Column.create(
          columnSnapshot({
            router: 'single',
            singleType: e.type,
            singleId: e.id,
            fromList: list,
          }),
        ),
      );
    }

    // populateWhenReady(list);

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

  const createContext = (selected, generator, contextIndex) => {
    const { items, options, infinite } = generator;
    const columns = items.reduce((generated, element) => {
      if (element.listType && element.extract) {
        const extracted = extractList(element);
        generated = generated.concat(extracted);
      } else {
        generated.push(columnSnapshot(element));
      }
      return generated;
    }, []);

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
    self.contexts.push(createContext(selected, context, contextIndex));
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
    [actionTypes.ROUTE_CHANGE_SUCCEED]: ({ selected, method, context }) => {
      init({ self, ...selected, fetching: false });

      if (context)
        context.items.forEach(item => {
          if (item instanceof Array) item.forEach(i => init({ self, ...i, fetching: false }));
          else init({ self, ...item, fetching: false });
        });

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
    [actionTypes.LIST_SUCCEED]: action => extractList(action, self.context),
  };
};
