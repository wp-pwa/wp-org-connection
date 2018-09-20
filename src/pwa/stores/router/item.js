import { when } from 'mobx';
import { types, getParent } from 'mobx-state-tree';

const BaseItem = types
  .model('BaseItem')
  .props({
    mstId: types.identifier,
    type: types.string,
    id: types.union(types.string, types.number),
    hasBeenVisited: false,
  })
  .views(self => ({
    get connection() {
      return getParent(self, 6);
    },
    get entity() {
      return self.connection.entity(self.type, self.id);
    },
    get isReady() {
      return self.entity.isReady;
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
    isExtracted() {
      return false;
    },
    get isSelected() {
      return getParent(self, 4).selectedItem === self;
    },
  }));

export const List = BaseItem.named('List')
  .props({
    page: types.number,
    extract: types.maybe(
      types.enumeration('Extract', ['horizontal', 'vertical']),
    ),
  })
  .views(self => ({
    get list() {
      return self.connection.list(self.type, self.id);
    },
    isExtracted(direction) {
      direction = direction ? [direction] : ['horizontal', 'vertical'];
      return direction.includes(self.extract);
    },
  }))
  .actions(self => {
    let stopReplace = null;
    return {
      beforeDestroy: () => {
        if (stopReplace) stopReplace();
      },
      afterCreate: () => {
        if (['horizontal', 'vertical'].includes(self.extract)) {
          const { type, id, page, extract } = self;
          stopReplace = when(
            () => self.connection.list(type, id).page(page).isReady === true,
            () => {
              self.parentContext.replaceExtractedList({
                type,
                id,
                page,
                extract,
              });
            },
          );
        }
      },
    };
  });

export const Single = BaseItem.named('Single').props({
  fromList: types.frozen({ type: 'latest', id: 'post', page: 1 }),
});

const Item = types.union(
  { dispatcher: ({ page }) => (page ? List : Single) },
  List,
  Single,
);

export default Item;
