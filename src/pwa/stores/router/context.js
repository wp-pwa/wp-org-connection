import { types, getRoot, resolveIdentifier, detach } from 'mobx-state-tree';
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
  })
  .views(self => ({
    get connection() {
      return getRoot(self);
    },
    get selectedItem() {
      return self.selectedColumn.selectedItem;
    },
    get columns() {
      return self.rawColumns.filter(column => column.items.length > 0);
    },
  }))
  .actions(self => {
    const getMstId = ({ type, id, page }) =>
      page ? `${self.index}_${type}_${id}_page_${page}` : `${self.index}_${type}_${id}`;
    const addMstIdToItem = ({ item }) => ({ mstId: getMstId({ ...item }), ...item });
    const addMstIdToItems = items => items.map(item => addMstIdToItem({ item }));
    return {
      setGenerator: generator => {
        self.generator = generator;
      },
      addColumn: (items, unshift) => {
        if (unshift) self.rawColumns.unshift({ rawItems: addMstIdToItems(items) });
        else self.rawColumns.push({ rawItems: addMstIdToItems(items) });
      },
      addColumns: columns => {
        columns.map(column => self.addColumn(column));
      },
      replaceColumns: columns => {
        self.rawColumns.replace(columns.map(column => ({ rawItems: addMstIdToItems(column) })));
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
      afterCreate: () => {},
    };
  });

export default Context;
