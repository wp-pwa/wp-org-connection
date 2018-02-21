import { types } from 'mobx-state-tree';
import Column from './column';

const Context = types
  .model('Context')
  .props({
    index: types.identifier(types.number),
    options: types.frozen,
    columns: types.optional(types.array(types.late(() => Column)), []),
    selectedColumn: types.optional(types.reference(types.late(() => Column), {
      get(mstId, parent) {
        return parent.columns.find(column => column.mstId === mstId) || parent.columns[0];
      },
      set(mstId) {
        return mstId;
      },
    }), ''),
    generator: types.frozen,
    infinite: true,
  })
  .views(self => ({
    get selectedItem() {
      return self.selectedColumn.selectedItem;
    },
    getItem(props, customizer) {
      let item;
      self.columns.find(col => {
        const i = col.getItem(props, customizer);
        if (i) item = i;
        return i;
      });
      return item || null;
    },
  }));

export default Context;
