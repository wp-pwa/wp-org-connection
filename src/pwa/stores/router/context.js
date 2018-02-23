import { types, getRoot, resolveIdentifier } from 'mobx-state-tree';
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
      return self.rawColumns;
    },
    // getItem({ props, customizer }) {
    //   let item;
    //   self.rawColumns.find(column => {
    //     const i = column.getItem({ props, customizer });
    //     if (i) item = i;
    //     return i;
    //   });
    //   return item || null;
    // },
  }))
  .actions(self => {
    const getMstId = ({ type, id, page }) =>
      page ? `${self.index}_${type}_${id}_page_${page}` : `${self.index}_${type}_${id}`;
    const addMstIdToItem = ({ item }) => ({ mstId: getMstId({ ...item }), ...item });
    const getRawItems = items => items.map(item => addMstIdToItem({ item }));
    return {
      addGenerator: generator => {
        self.generator = generator;
      },
      addColumn: (items, unshift) => {
        if (unshift) self.rawColumns.unshift({ items: getRawItems(items) })
        else self.rawColumns.push({ items: getRawItems(items) });
      },
      addColumns: columns => {
        columns.map(column => self.addColumn(column));
      },
      hasItem: item => !!resolveIdentifier(Item, self, getMstId(item)),
      getItem: item => resolveIdentifier(Item, self, getMstId(item)),
      addItem: (item, unshift) => {
        self.addColumn([item], unshift)
        return self.getItem(item);
      },
      changeSelectedColumnUsingItem: ({ selected }) => {
        const item = self.getItem({ props: selected });
        self.selectedColumn = item.parentColumn.mstId;
      },
      afterCreate: () => {},
    };
  });

export default Context;
