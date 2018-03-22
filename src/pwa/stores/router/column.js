import { types, getParent, resolveIdentifier } from 'mobx-state-tree';
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
      return self.rawItems.reduce(
        (acc, item) => acc || ['horizontal', 'vertical'].includes(item.extract),
        false,
      );
    },
  }));

export default Column;
