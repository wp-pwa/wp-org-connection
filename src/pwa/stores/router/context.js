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
    },
  }));

export default Context;
