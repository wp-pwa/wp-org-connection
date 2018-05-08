import { autorun } from 'mobx';
import { types, getParent, resolveIdentifier } from 'mobx-state-tree';
import Item from './item';

const Column = types
  .model('Column')
  .props({
    mstId: types.identifier(types.string),
    rawItems: types.optional(types.array(types.late(() => Item)), []),
    selectedItem: types.optional(
      types.reference(types.late(() => Item), {
        get: (mstId, parent) => resolveIdentifier(Item, parent, mstId) || parent.items[0] || null,
        set: item => item.mstId || item,
      }),
      '',
    ),
  })
  .views(self => ({
    get items() {
      const items = [];
      for (let i = 0; i < self.rawItems.length; i += 1) {
        if (self.rawItems[i].isExtracted()) break;
        items[i] = self.rawItems[i];
      }
      return items;
    },
    get nextColumn() {
      const { columns } = self.parentContext;
      const index = columns.indexOf(self);
      return index < columns.length - 1 ? columns[index + 1] : null;
    },
    get hasNextColumn() {
      return !!self.nextColumn;
    },
    get hasNonVisited() {
      return !!self.items.find(item => item.hasBeenVisited === false);
    },
    get index() {
      const columns = getParent(self);
      return columns ? columns.indexOf(self) : -1;
    },
    hasExtracted(direction) {
      direction = direction ? [direction] : ['horizontal', 'vertical'];
      return self.rawItems.reduce((acc, item) => acc || direction.includes(item.extract), false);
    },
    get parentContext() {
      return getParent(self, 2);
    },
    get isSelected() {
      return getParent(self, 2).selectedColumn === self;
    },
  }))
  .actions(self => {
    self.stopExtractCheck = null;
    return {
      addItem: ({ item, index }) => {
        const i = index || self.rawItems.length;
        self.rawItems.splice(i, 0, self.parentContext.addMstIdToItem({ item }));
      },
      beforeDestroy: () => {
        self.stopExtractCheck();
      },
      afterCreate: () => {
        self.stopExtractCheck = autorun(() => {
          if (self.hasExtracted('horizontal') && self.rawItems.length > 1) {
            throw new Error("Don't add extracted lists with other items in the same column.");
          }
        });
      },
    };
  });

export default Column;
