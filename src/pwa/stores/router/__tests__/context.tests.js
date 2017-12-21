import Context from '../context';
import Connection from '../..';

describe('Store > Context ', () => {
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

  const column1 = {
    _id: 'column-snapshot-001',
    selected: item2._id,
    items: [item1, item2],
  };

  const column2 = {
    _id: 'column-snapshot-002',
    selected: item3._id,
    items: [item3],
  };

  const context = Context.create({
    index: 0,
    column: column1._id,
    columns: [column1, column2],
  });

  Connection.create({
    contexts: [context],
  });

  test('props are populated appropriately', () => {
    expect(context).toMatchSnapshot();
  });

  test('get item', () => {
    expect(context.getItem({})).toMatchSnapshot();
    expect(context.getItem({ listType: 'category' })).toMatchSnapshot();
    expect(context.getItem({ listType: 'category', listId: 1 })).toMatchSnapshot();
    expect(context.getItem({ listType: 'category', listId: 1, page: 2 })).toMatchSnapshot();
    expect(context.getItem({ listType: 'tag' })).toBeNull();
    expect(context.getItem({ singleType: 'post' })).toBeNull();
  });

  test('selected', () => {
    expect(context.selected).toMatchSnapshot();
  });
});
