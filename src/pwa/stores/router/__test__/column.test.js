import uuid from 'uuid/v4';

import Column from '../column';

let column;
beforeEach(() => {
  const columnId = uuid();
  const item = () => ({
    _id: uuid(),
    route: 'list',
    listType: 'latest',
    column: columnId,
  });

  const item1 = item();
  const item2 = item();
  const item3 = item();
  const item4 = item();

  column = Column.create({
    _id: columnId,
    items: [item1, item2, item3, item4],
    selected: item1._id,
  });
});

test('Column is instatiated appropriately', () => {
  expect(column.items[0].column).toEqual(column);
  expect(column.items[3].column).toEqual(column);
  expect(column.items[0].column.items[0]).toEqual(column.selected);
});

test('get item', () => {
  expect(column.getItem({ singleType: 'post', singleId: 60 })).toBe(null);
  expect(column.getItem({ listType: 'latest' }).type).toBe('latest');
  expect(column.getItem({ listType: 'latest' }).id).toBe(null);
  expect(column.getItem({ listType: 'latest' }).column._id).toBe(column._id);
});
