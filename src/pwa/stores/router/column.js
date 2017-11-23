import { types, getParent } from 'mobx-state-tree';
import { isMatch, omit, isUndefined } from 'lodash';
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
    getItem(props) {
      return self.items.find(i => isMatch(i, omit(props, isUndefined))) || null;
    },
    get next() {
      const columns = getParent(self);
      const index = columns.indexOf(self);
      return index < columns.length - 1 ? columns[index + 1] : null;
    },
  }));

export default Column;
