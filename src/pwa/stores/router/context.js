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
  .views(self => {
    const iterable = {
      [Symbol.iterator]: function* it() {
        let item = self.columns[0].items[0];
        while (item.next) {
          yield item;
          item = item.next;
        }
        yield item;
      },
    };

    return {
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
      get items() {
        return [...iterable];
      },
    };
  });

export default Context;
