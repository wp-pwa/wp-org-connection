import { types } from 'mobx-state-tree';
import { Item } from './item';

const Column = types
  .model('Column')
  .props({
    id: types.identifier(types.string),
    items: types.optional(types.array(types.late(() => Item)), []),
    selected: types.reference(types.late(() => Item)),
  })
  .views(self => ({
    getItem({ singleType, singleId, listType, listId, page }) {
      return self.items.find(
        i =>
          (!listType || listType === i.listType) &&
          (!listId || listId === i.listId) &&
          (!page || page === i.page) &&
          (!singleType || singleType === i.singleType) &&
          (!singleId || singleId === i.singleId),
      )
    },
  }))
  .actions(self => ({
    afterCreate() {
      self.items.forEach(item => {
        item.column = self;
      });
    },
  }));

export default Column;
