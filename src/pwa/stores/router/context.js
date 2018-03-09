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
    const addMstIdToItems = items => items.map(item => addMstIdToItem({ item }));
    return {
      setGenerator: generator => {
        self.generator = generator;
      },
      addColumn: (items, unshift) => {
        if (unshift)
          self.rawColumns.unshift({ mstId: getNextMstId(), rawItems: addMstIdToItems(items) });
        else self.rawColumns.push({ mstId: getNextMstId(), rawItems: addMstIdToItems(items) });
      },
      addColumns: columns => {
        columns.map(column => self.addColumn(column));
      },
      replaceColumns: columns => {
        self.rawColumns.replace(
          columns.map(column => ({ mstId: getNextMstId(), rawItems: addMstIdToItems(column) })),
        );
      },
      hasItem: item => !!resolveIdentifier(Item, self, getMstId(item)),
      getItem: item => resolveIdentifier(Item, self, getMstId(item)),
      addItem: (item, unshift) => {
        self.addColumn([item], unshift);
        return self.getItem(item);
      },
      addItemIfMissing: (item, unshift) => {
        if (!self.hasItem(item)) {
          self.addItem(item, unshift);
        }
      },
      moveItem: item => {
        const newItem = self.getItem(item);
        const newItemParentColumn = newItem.parentColumn;
        detach(newItem);
        if (newItemParentColumn.items.length === 0) self.rawColumns.remove(newItemParentColumn);
        self.selectedItem.parentColumn.rawItems.push(newItem);
      },
    };
  });

export default Context;
