import uuid from 'uuid/v4';

import Column from '../column';

test('Column is instatiated appropriately', () => {
  const item = () => ({
    id: uuid(),
    route: 'list',
    listType: 'latest',
  });

  const item1 = item();
  const item2 = item();
  const item3 = item();
  const item4 = item();

  const col = Column.create({
    id: uuid(),
    items: [item1, item2, item3, item4],
    selected: item1.id,
  })

  expect(col.items[0].column).toEqual(col);
  expect(col.items[3].column).toEqual(col);
  expect(col.items[0].column.items[0]).toEqual(col.selected);
});
