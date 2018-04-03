import { types, getRoot, resolveIdentifier, detach, getSnapshot } from 'mobx-state-tree';
import Column from './column';
import Item from './item';

const Context = types
  .model('Context')
  .props({
    index: types.identifier(types.number),
    options: types.frozen,
    rawColumns: types.optional(types.array(types.late(() => Column)), []),
    selectedColumn: types.optional(
      types.reference(types.late(() => Column), {
        get: (mstId, parent) => resolveIdentifier(Column, parent, mstId) || parent.columns[0],
        set: column => column.mstId || column,
      }),
      '',
    ),
    generator: types.frozen,
    infinite: types.frozen,
    mstIdForColumn: 0,
  })
  .views(self => ({
    get connection() {
      return getRoot(self);
    },
    get selectedItem() {
      return self.selectedColumn.selectedItem;
    },
    get columns() {
      const selectedColumnIndex = self.rawColumns.findIndex(
        ({ mstId }) => mstId === getSnapshot(self).selectedColumn,
      );
      const columns = [];
      // Traverse the columns from selectedColumnIndex to 0 until we find an empty column. This
      // includes the selectedColumn as well.
      for (let i = selectedColumnIndex; i >= 0; i -= 1) {
        if (self.rawColumns[i].items.length === 0) break;
        columns[i] = self.rawColumns[i];
      }
      // Traverse the columns from selectedColumnIndex + 1 till the end until we find an
      // empty column.
      for (let i = selectedColumnIndex + 1; i < self.rawColumns.length; i += 1) {
        if (self.rawColumns[i].items.length === 0) break;
        columns[i] = self.rawColumns[i];
      }
      return columns.filter(column => column.items.length > 0);
    },
    get nextNonVisited() {
      const firstColumnWithNonVisited = self.columns.find(column => column.hasNonVisited);

      return (
        (firstColumnWithNonVisited &&
          firstColumnWithNonVisited.items.find(item => item.visited === false)) ||
        null
      );
    },
  }))
  .actions(self => ({
    getNextMstId: () => {
      self.mstIdForColumn += 1;
      return `context_${self.index}_column_${self.mstIdForColumn}`;
    },
    getMstId: ({ type, id, page, extract }) =>
      page
        ? `${self.index}_${type}_${id}_page_${page}${extract ? `_${extract}` : ''}`
        : `${self.index}_${type}_${id}`,
    addMstIdToItem: ({ item }) => ({ ...item, mstId: self.getMstId({ ...item }) }),
    addMstIdToItems: ({ items }) => items.map(item => self.addMstIdToItem({ item })),
    setGenerator: ({ generator }) => {
      self.generator = generator;
    },
    setOptions: ({ options }) => {
      self.options = options;
    },
    getItem: ({ item: { type, id, page, extract } }) =>
      resolveIdentifier(Item, self, self.getMstId({ type, id, page, extract })),
    hasItem: ({ item }) => !!self.getItem({ item }),
    addItem: ({ item, index }) => {
      self.addColumn({ column: [item], index });
      return self.getItem({ item });
    },
    addItems: ({ items, index }) => {
      let i = index || self.rawColumns.length;
      items.forEach(item => {
        self.addColumn({ column: [item], index: i });
        i += 1;
      });
    },
    addItemIfMissing: ({ item, index }) => {
      if (!self.hasItem({ item })) {
        self.addItem({ item, index });
      }
    },
    addItemsIfMissing: ({ items, index }) => {
      let i = index || self.rawColumns.length;
      items.forEach(item => {
        if (!self.hasItem({ item })) {
          self.addColumn({ column: [item], index: i });
          i += 1;
        }
      });
    },
    deleteItem: ({ item }) => item.parentColumn.rawItems.remove(item),
    addColumn: ({ column, index }) => {
      if (!Array.isArray(column)) {
        throw new Error('Columns should be arrays and not single objects.');
      }
      const i = typeof index !== 'undefined' ? index : self.rawColumns.length;
      self.rawColumns.splice(i, 0, {
        mstId: self.getNextMstId(),
        rawItems: self.addMstIdToItems({ items: column }),
      });
    },
    addColumns: ({ columns, index }) => {
      let i = index || self.rawColumns.length;
      columns.forEach(column => {
        self.addColumn({ column, index: i });
        i += 1;
      });
    },
    replaceColumns: ({ columns }) => {
      self.rawColumns.replace(
        columns.map(column => ({
          mstId: self.getNextMstId(),
          rawItems: self.addMstIdToItems({ items: column }),
        })),
      );
    },
    deleteColumn: ({ column }) => self.rawColumns.remove(column),
    moveItem: item => {
      const newItem = self.getItem(item);
      const newItemParentColumn = newItem.parentColumn;
      detach(newItem);
      if (newItemParentColumn.items.length === 0) self.rawColumns.remove(newItemParentColumn);
      self.selectedItem.parentColumn.rawItems.push(newItem);
    },
    replaceExtractedList: ({ type, id, page, extract }) => {
      const oldItem = self.getItem({ item: { type, id, page, extract } });
      const oldColumn = oldItem.parentColumn;
      const oldIndex = oldItem.parentColumn.index;
      self.deleteItem({ item: oldItem });
      if (oldColumn.rawItems.length === 0) self.deleteColumn({ column: oldColumn });
      const items = self.connection.list(type, id).page(page).entities;
      if (items.length > 0) self.addItemsIfMissing({ items, index: oldIndex });
    },
  }));

export default Context;
