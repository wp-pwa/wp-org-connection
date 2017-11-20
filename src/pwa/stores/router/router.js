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
    const newColumn = element => {
      const colId = uuid();
      const column = {
        _id: colId,
        items: element instanceof Array ? element : [element],
      };
      column.items = column.items.map(item => {
        const { _id = uuid(), ...rest } = item;
        return { _id, ...rest, column: colId }
      });
      column.selected = column.items[0]._id;

      return column;
    };

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

      // Fixes next attributes for items
      self.context.afterCreate();
    }

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

    const extractList = list => {
      const perPage = 5; // from where should this value be obtained?
      const columns = [];
      times(perPage, () =>
        columns.push(Column.create(newColumn({ router: 'single', singleType: 'post' }))),
      );

      populateWhenReady(list, columns);
      return columns;
    };

    const createContext = (selected, generator) => {
      const { items, options, infinite } = generator;
      const contextIndex = self.context ? self.context.index + 1 : 0;
      const columns = items.reduce((generated, element) => {
        if (element.listType && element.extract) {
          generated.concat(extractList(element));
        } else {
          generated.push(newColumn(element));
        }
        return generated;
      }, []);

      self.contexts.push({
        index: contextIndex,
        column: columns[0]._id,
        columns,
        options,
        infinite,
        generator,
      });

      self.context = self.contexts[contextIndex];

      changeSelected(selected);
    };

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
        if (context === null) {
          if (self.context === null || !self.context.getItem(selected)) {
            createContextFromSelected(selected);
          } else {
            if (method === 'push') changeSelected(selected);
            if (method === 'replace') moveSelected(selected);
          }
        } else if (self.context === null || !isEqual(self.context.generator, context)) {
          if (method === 'push') {
            createContext(selected, context);
          }
        } else if (isEqual(self.context.generator, context)) {
          if (method === 'push') changeSelected(selected);
          if (method === 'replace') moveSelected(selected);
        }
      },
    };
  });

export default Router;
