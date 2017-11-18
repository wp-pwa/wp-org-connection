import uuid from 'uuid/v4';

import Column from '../column';
import Context from '../context';

test('Context is instatiated appropriately', () => {
  const item = () => ({
    id: uuid(),
    route: 'list',
    listType: 'latest',
  });

  const item1 = item();
  const item2 = item();
  const item3 = item();

  const item4 = item();
  const item5 = item();
  const item6 = item();

  const item7 = item();
  const item8 = item();
  const item9 = item();

  const col1 = Column.create({
    id: uuid(),
    items: [item1, item2, item3],
    selected: item1.id,
  })
  const col2 = Column.create({
    id: uuid(),
    items: [item4, item5, item6],
    selected: item4.id,
  })
  const col3 = Column.create({
    id: uuid(),
    items: [item7, item8, item9],
    selected: item5.id,
  })

  const ctx = Context.create({
    id: uuid(),
    columns: [col1, col2, col3],
    selected: col1,
  })

  expect(ctx.column.items[0].next).toEqual(ctx.columns[0].items[1]);
  expect(ctx.column.items[2].next).toEqual(ctx.columns[1].items[0]);
  expect(ctx.columns[2].items[2].next).toBe(null);
});
