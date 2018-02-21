import { types, getParent } from 'mobx-state-tree';
import { isMatchWith, omitBy, isUndefined } from 'lodash';
import uuid from 'uuid/v4';
import { Item } from './item';

const Column = types
  .model('Column')
  .props({
    mstId: types.optional(types.identifier(types.string), uuid),
    items: types.optional(types.array(types.late(() => Item)), []),
    selectedItem: types.optional(types.reference(types.late(() => Item), {
      get(mstId, parent) {
        return parent.items.find(item => item.mstId === mstId) || parent.items[0];
      },
      set(mstId) {
        return mstId;
      },
    }), ''),
  })
  .views(self => ({
    getItem(props, customizer) {
      return self.items.find(i => isMatchWith(i, omitBy(props, isUndefined), customizer)) || null;
    },
    get nextColumn() {
      const columns = getParent(self);
      const index = columns.indexOf(self);
      return index < columns.length - 1 ? columns[index + 1] : null;
    },
    get index() {
      const columns = getParent(self);
      return columns ? columns.indexOf(self) : -1;
    },
  }));

export default Column;
