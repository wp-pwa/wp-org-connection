import { types, detach } from 'mobx-state-tree';
import { when } from 'mobx';
import uuid from 'uuid/v4';
import { times, isEqual } from 'lodash';
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
        selectedItem.column = current.column;
        selectedItem.column.selected = selectedItem;
      }

      // Fixes 'next' attribute for items
      self.context.afterCreate();
    };

    const populateWhenReady = ({ listType, listId, page }, columns) =>
      when(
        () => stores.connection.list[listType][listId].page[page].ready,
        () => {
          const { entities } = stores.connection.list[listType][listId].page[page];
          columns.forEach((column, i) => {
            column[0].singleId = entities[i].id;
          });
        },
      );

    const newColumn = element => {
      const colId = uuid();
      const column = {
        _id: colId,
        items: element instanceof Array ? element : [element],
      };
      column.items = column.items.map(item => {
        const { _id = uuid(), ...rest } = item;
        return { _id, ...rest, column: colId };
      });
      column.selected = column.items[0]._id;

      return column;
    };

    const extractList = list => {
      const perPage = 5; // from where should this value be obtained?
      const columns = [];
      times(perPage, () =>
        columns.push(Column.create(newColumn({ router: 'single', singleType: 'post' }))),
      );

      populateWhenReady(list, columns);
      return columns;
    };

    const createContext = (selected, generator, contextIndex) => {
      const { items, options, infinite } = generator;
      const columns = items.reduce((generated, element) => {
        if (element.listType && element.extract) {
          generated.concat(extractList(element));
        } else {
          generated.push(newColumn(element));
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
  });

export default Router;
