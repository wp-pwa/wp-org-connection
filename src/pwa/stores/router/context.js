import { types } from 'mobx-state-tree';
import Column from './column';

const Context = types
  .model('Context')
  .props({
    index: types.identifier(types.number),
    options: types.frozen,
    columns: types.optional(types.array(types.late(() => Column)), []),
    column: types.reference(types.late(() => Column)),
    generator: types.frozen,
    infinite: true,
  })
  .views(self => ({
    get selected() {
      return self.column.selected;
    },
    getItem(props) {
      let item;
      self.columns.find(col => {
        const i = col.getItem(props);
        if (i) item = i;
        return i;
      });
      return item || null;
    }
  }))
  .actions(self => ({
    afterCreate() {
      const flattened = self.columns.reduce(
        (all, column) => all.concat(column.items.map(e => e)),
        [],
      );
      flattened.forEach((item, index) => {
        item.next = flattened[index + 1] || null;
      });
    },
  }));

export default Context;
