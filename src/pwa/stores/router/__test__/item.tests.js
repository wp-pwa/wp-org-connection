import { getSnapshot } from 'mobx-state-tree';
import uuid from 'uuid/v4';

import { Item } from '../item';

test('An item of type Single is populated appropriately', () => {
  const item = Item.create({
    _id: uuid(),
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    fromList: { id: 0, listType: 'latest' },
  });
  expect(getSnapshot(item)).toEqual({
    _id: item._id,
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    fromList: {
      _id: item.fromList._id,
      listId: 'post',
      listType: 'latest',
      page: 1,
      route: 'list',
    },
  });
});

test('An item of type List is populated appropriately', () => {
  const item = Item.create({
    _id: '124',
    listType: 'latest',
  });
  expect(getSnapshot(item)).toEqual({
    _id: '124',
    listId: 'post',
    listType: 'latest',
    page: 1,
    route: 'list',
  });
});
