import { types, getParent } from 'mobx-state-tree';
import { Item } from './item';

import Id from '../id';

const Column = types
  .model('Column')
  .props({
    _id: Id,
    items: types.optional(types.array(types.late(() => Item)), []),
    selected: types.reference(types.late(() => Item)),
  })
  .views(self => ({
    getItem({ singleType, singleId, listType, listId, page }) {
      return (
        self.items.find(
          i =>
            (!listType || listType === i.listType) &&
            (!listId || listId === i.listId) &&
            (!page || page === i.page) &&
            (!singleType || singleType === i.singleType) &&
            (!singleId || singleId === i.singleId),
        ) || null
      );
    },
    get next() {
      const columns = getParent(self);
      const index = columns.indexOf(self);
      return index < columns.length - 1 ? columns[index + 1] : null;
    },
  }));

export default Column;
