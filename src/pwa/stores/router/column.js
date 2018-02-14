import { types, getParent } from 'mobx-state-tree';
import { isMatchWith, omitBy, isUndefined } from 'lodash';
import { Item } from './item';

import Id from './id';

const Column = types
  .model('Column')
  .props({
    _id: Id,
    items: types.optional(types.array(types.late(() => Item)), []),
    selected: types.reference(types.late(() => Item)),
  })
  .views(self => ({
    getItem(props, customizer) {
      return (
        self.items.find(
          i => isMatchWith(i, omitBy(props, isUndefined), customizer),
        ) || null
      );
    },
    get next() {
      const columns = getParent(self);
      const index = columns.indexOf(self);
      return index < columns.length - 1 ? columns[index + 1] : null;
    },
    get index() {
      const columns = getParent(self);
      return columns ? columns.indexOf(self) : -1;
    }
  }));

export default Column;
