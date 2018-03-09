import { types, getParent, resolveIdentifier } from 'mobx-state-tree';
import { isMatchWith, omitBy, isUndefined } from 'lodash';
import Item from './item';

const Column = types
  .model('Column')
  .props({
    mstId: types.identifier(types.string),
    rawItems: types.optional(types.array(types.late(() => Item)), []),
    selectedItem: types.optional(
      types.reference(types.late(() => Item), {
        get: (mstId, parent) => resolveIdentifier(Item, parent, mstId) || parent.items[0],
        set: item => item.mstId || item,
      }),
      '',
    ),
  })
  .views(self => ({
    getItem({ props, customizer }) {
      return (
        self.rawItems.find(i => isMatchWith(i, omitBy(props, isUndefined), customizer)) || null
      );
    },
    get items() {
      return self.rawItems.filter(item => !item.extract);
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
    get hasExtracted() {
      return self.rawItems.reduce((acc, item) => acc || item.extract === true, false);
    },
  }));

export default Column;
