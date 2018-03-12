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
      // Traverse the columns from 0 to selectedColumnIndex until we find an extracted item. This
      // includes the selectedColumn as well.
      for (let i = selectedColumnIndex; i >= 0; i -= 1) {
        if (self.rawColumns[i].hasExtracted) break;
        columns[i] = self.rawColumns[i];
      }
      // Traverse the columns from selectedColumnIndex + 1 till the end until we find an
      // extracted item.
      for (let i = selectedColumnIndex + 1; i < self.rawColumns.length; i += 1) {
        if (self.rawColumns[i].hasExtracted) break;
        columns[i] = self.rawColumns[i];
      }
      return columns.filter(column => column.items.length > 0);
    },
  }))
  .actions(self => {
    const getNextMstId = () => {
      self.mstIdForColumn += 1;
      return `context_${self.index}_column_${self.mstIdForColumn}`;
    };
    const getMstId = ({ type, id, page }) =>
      page ? `${self.index}_${type}_${id}_page_${page}` : `${self.index}_${type}_${id}`;
    const addMstIdToItem = ({ item }) => ({ mstId: getMstId({ ...item }), ...item });
    const addMstIdToItems = ({ items }) => items.map(item => addMstIdToItem({ item }));
    return {
      setGenerator: ({ generator }) => {
        self.generator = generator;
      },
      getItem: ({ item: { type, id, page } }) =>
        resolveIdentifier(Item, self, getMstId({ type, id, page })),
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
      deleteItem: ({ item }) => item.parentColumn.rawItems.remove(item),
      addColumn: ({ column, index }) => {
        const i = typeof index !== 'undefined' ? index : self.rawColumns.length;
        self.rawColumns.splice(i, 0, {
          mstId: getNextMstId(),
          rawItems: addMstIdToItems({ items: column }),
        });
        if (self.rawColumns[i].hasExtracted && self.rawColumns[i].rawItems.length > 1)
          throw new Error("Don't add extracted lists with other items in the same column.");
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
            mstId: getNextMstId(),
            rawItems: addMstIdToItems({ items: column }),
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
      replaceExtractedList: ({ type, id, page }) => {
        const oldItem = self.getItem({ item: { type, id, page } });
        const { parentColumn, extract } = oldItem.parentColumn;
        const oldIndex = oldItem.parentColumn.index;
        self.deleteItem({ item: oldItem });
        if (parentColumn.rawItems.length === 0) self.deleteColumn({ column: parentColumn });
        const items = self.connection.list(type, id).page(page).entities;
        if (extract === 'left') self.addItems({ items, index: oldIndex, direction: 'left' });
        else if (extract === 'down') self.addItemsToColumn({ items, index: oldIndex, direction: 'left' });
        else self.addItemsT({ items, index: oldIndex, direction: 'left' });
      },
    };
  });

export default Context;
