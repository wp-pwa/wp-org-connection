import { getSnapshot } from 'mobx-state-tree';
import uuidv1 from 'uuid/v1';

import { Item } from '../item';

test('An item of type Single is populated appropriately', () => {
  const item = Item.create({
    id: uuidv1(),
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    goBack: { id: 0, listType: 'latest' },
  });
  expect(getSnapshot(item)).toEqual({
    id: item.id,
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    isReady: false,
    goBack: {
      id: 0,
      isReady: false,
      listId: 0,
      listType: 'latest',
      page: 0,
      route: 'list',
      singleType: 'post',
    },
    column: null,
    next: null,
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
