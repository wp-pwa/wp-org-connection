import { when } from 'mobx';
import { types, getParent, getRoot } from 'mobx-state-tree';

const BaseItem = types
  .model('BaseItem')
  .props({
    mstId: types.identifier(types.string),
    type: types.string,
    id: types.union(types.string, types.number),
    extract: types.maybe(types.string),
    visited: false,
  })
  .views(self => ({
    get connection() {
      return getRoot(self);
    },
    get entity() {
      return self.connection.entity(self.type, self.id);
    },
    get ready() {
      return self.entity.ready;
    },
    get isSingle() {
      return !self.page;
    },
    get isList() {
      return !!self.page;
    },
    get parentColumn() {
      return getParent(self, 2);
    },
    get parentContext() {
      return getParent(self, 4);
    },
    get nextItem() {
      const items = getParent(self);
      const index = items.indexOf(self);
      return index === items.length - 1
        ? self.column.nextColumn && self.column.nextColumn.items[0]
        : items[index + 1];
    },
  }));

export const List = BaseItem.named('List')
  .props({
    page: types.number,
  })
  .views(self => ({
    get list() {
      return self.connection.list(self.type, self.id);
    },
  }))
  .actions(self => ({
    afterCreate: () => {
      if (['right', 'left', 'bottom'].includes(self.extract)) {
        const { type, id, page } = self;
        const stopReplace = when(
          () => self.connection.list(type, id).page(page).ready === true,
          () => {
            stopReplace();
            self.parentContext.replaceExtractedList({ type, id, page });
          },
        );
      }
    },
  }));

export const Single = BaseItem.named('List').props({
  fromList: types.optional(types.frozen, { type: 'latest', id: 'post', page: 1 }),
});

const Item = types.union(({ page }) => (page ? List : Single), List, Single);

export default Item;
