import { types, getRoot } from 'mobx-state-tree';
import Column from './column';

const Context = types
  .model('Context')
  .props({
    index: types.identifier(types.number),
    options: types.frozen,
    rawColumns: types.array(types.late(() => Column)),
    selectedColumn: types.optional(
      types.reference(types.late(() => Column), {
        get: (mstId, parent) =>
          parent.columns.find(column => column.mstId === mstId) || parent.columns[0],
        set: mstId => mstId,
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
    getItem({ props, customizer }) {
      let item;
      self.rawColumns.find(column => {
        const i = column.getItem({ props, customizer });
        if (i) item = i;
        return i;
      });
      return item || null;
    },
  }))
  .actions(self => ({
    changeSelectedColumnUsingItem: ({ selected }) => {
      const item = self.getItem({ props: selected });
      self.selectedColumn = item.parentColumn.mstId;
    },
    afterCreate: () => {

    },
  }));

export default Context;
