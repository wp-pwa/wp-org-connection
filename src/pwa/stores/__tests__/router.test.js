import { getSnapshot } from 'mobx-state-tree';
import { Router, Item } from '../router';

test('Router store should initiate empty', () => {
  const { contexts, activeContext, selected } = getSnapshot(Router.create({}));
  expect(contexts).toEqual([]);
  expect(activeContext).toEqual(null);
  expect(selected).toEqual(null);
});

test('An item of type Single is populated appropriately', () => {
  const item = Item.create({
    id: 123,
    route: 'single',
    singleType: 'post',
    singleId: 1234,
  });
  expect(getSnapshot(item)).toEqual({
    id: 123,
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    isReady: false,
  });
});

test('An item of type List is populated appropriately', () => {
  const item = Item.create({
    id: 124,
    route: 'list',
  });
  expect(getSnapshot(item)).toEqual({
    id: 124,
    isReady: false,
    listId: 0,
    listType: 'latest',
    page: 0,
    route: 'list',
    singleType: 'post',
  });
});

test('Context is populated appropriately', () => {
  const store = Router.create({
    activeContext: 333,
    contexts: [
      {
        id: 333,
        selected: 123,
        items: [
          {
            id: 123,
            route: 'single',
            singleType: 'post',
            singleId: 1234,
          },
          {
            id: 124,
            route: 'list',
          },
        ],
        infinite: false,
        options: null,
      },
    ],
    selected: null,
  });

  expect(getSnapshot(store.activeContext)).toEqual({
    id: 333,
    selected: 123,
    items: [
      {
        id: 123,
        route: 'single',
        singleType: 'post',
        singleId: 1234,
        isReady: false,
      },
      {
        id: 124,
        isReady: false,
        listId: 0,
        listType: 'latest',
        page: 0,
        route: 'list',
        singleType: 'post',
      },
    ],
    infinite: false,
    options: null,
  });
});
