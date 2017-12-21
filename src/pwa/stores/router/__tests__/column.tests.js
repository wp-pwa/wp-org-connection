import Column from '../column';
import Connection from '../..';

describe('Store > Context > Column ', () => {
  const item1 = {
    _id: 'item-snapshot-001',
    listType: 'category',
    listId: 1,
    page: 1,
  };

  const item2 = {
    _id: 'item-snapshot-002',
    listType: 'category',
    listId: 1,
    page: 2,
  };

  const item3 = {
    _id: 'item-snapshot-003',
    listType: 'category',
    listId: 1,
    page: 3,
  };

  const column1 = Column.create({
    _id: 'column-snapshot-001',
    selected: item1._id,
    items: [item1, item2],
  });

  const column2 = Column.create({
    _id: 'column-snapshot-002',
    selected: item3._id,
    items: [item3],
  });

  Connection.create({
    contexts: [
      {
        index: 0,
        column: column1,
        columns: [column1, column2],
      },
    ],
  });

  test('props are populated appropriately', () => {
    expect(column1).toMatchSnapshot();
    expect(column2).toMatchSnapshot();
  });

  test('get item', () => {
    expect(column1.getItem({})).toMatchSnapshot();
    expect(column1.getItem({ listType: 'category' })).toMatchSnapshot();
    expect(column1.getItem({ listType: 'category', listId: 1 })).toMatchSnapshot();
    expect(column1.getItem({ listType: 'category', listId: 1, page: 2 })).toMatchSnapshot();
    expect(column2.getItem({ listType: 'tag' })).toBeNull();
    expect(column2.getItem({ singleType: 'post' })).toBeNull();
  });

  test('next', () => {
    expect(column1.next).toBe(column2);
    expect(column2.next).toBe(null);
  });

  test('index', () => {
    expect(column1.index).toBe(0);
    expect(column2.index).toBe(1);
  });
});
