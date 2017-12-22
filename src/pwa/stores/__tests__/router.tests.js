import Connection from '../';
import * as actionTypes from '../../actionTypes';
import * as actions from '../../actions';

describe('Router', () => {
  let connection;
  beforeEach(() => {
    connection = Connection.create({});
  });

  const toPost = ({ id, type, method, context }) => {
    const payload = { selected: { singleType: type || 'post', singleId: id } };
    if (method) payload.method = method;
    if (context) payload.context = context;
    return actions.routeChangeSucceed(payload);
  };

  const toList = ({ id, type, method, context }) => {
    const payload = { selected: { listType: type || 'category', listId: id } };
    if (method) payload.method = method;
    if (context) payload.context = context;
    return actions.routeChangeSucceed(payload);
  };

  const context1 = {
    infinite: false,
    items: [
      { singleType: 'post', singleId: 60 },
      { singleType: 'post', singleId: 68 },
      { singleType: 'post', singleId: 70 },
      [
        { singleType: 'post', singleId: 90 },
        { singleType: 'post', singleId: 98 },
        { singleType: 'post', singleId: 99 },
      ],
    ],
  };

  const context2 = {
    infinite: false,
    items: [
      [{ singleType: 'post', singleId: 60 }, { listType: 'latest', listId: 'post' }],
      { listType: 'category', listId: 12 },
      { listType: 'category', listId: 13 },
      { listType: 'category', listId: 14 },
      { listType: 'category', listId: 20 },
      { listType: 'category', listId: 22 },
    ],
  };

  const context3 = {
    infinite: false,
    items: [
      [{ singleType: 'post', singleId: 60 }, { listType: 'latest', listId: 'post' }],
      { singleType: 'post', singleId: 68 },
      { singleType: 'post', singleId: 70 },
      { singleType: 'post', singleId: 90 },
      { singleType: 'post', singleId: 98 },
      { singleType: 'post', singleId: 99 },
    ],
  };

  const contextAll = {
    infinite: false,
    items: [
      [{ singleType: 'post', singleId: 60 }, { listType: 'latest', listId: 'post' }],
      { listType: 'category', listId: 12, extract: true },
    ],
  };

  const contextEmpty = {
    infinite: false,
    items: [],
  };

  test('initializes empty', () => {
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.context).toBeNull();
  });

  test('initializes items from context and selected', () => {
    connection[actionTypes.ROUTE_CHANGE_REQUESTED](toPost({ id: 160, context: contextAll }));
    expect(connection.single.post[160]).toMatchSnapshot();
    expect(connection.single.post[60]).toMatchSnapshot();
    expect(connection.single.category[12]).toMatchSnapshot();
    expect(connection.list.category[12].page[0]).toMatchSnapshot();
    expect(connection.list.latest.post.page[0]).toMatchSnapshot();
  });

  test('creates a new context from selected post', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60 }));
    expect(connection.selected.type).toBe('post');
    expect(connection.selected.id).toBe(60);
    expect(connection.context.index).toBe(0);
    expect(connection.context.column.selected.id).toBe(60);
    expect(connection.context.columns[0].selected.id).toBe(60);
    expect(connection.contexts[0].columns[0].selected.id).toBe(60);
  });

  test('creates a new context from selected list', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toList({ id: 7 }));
    expect(connection.selected.type).toBe('category');
    expect(connection.selected.id).toBe(7);
    expect(connection.selected.page).toBe(1);
    expect(connection.context.index).toBe(0);
    expect(connection.context.column.selected.id).toBe(7);
    expect(connection.context.columns[0].selected.id).toBe(7);
    expect(connection.contexts[0].columns[0].selected.id).toBe(7);
  });

  test('creates another context from selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60 }));
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 70 }));
    // Current item
    expect(connection.context.index).toBe(1);
    expect(connection.selected.id).toBe(70);
    expect(connection.selected.type).toBe('post');
    expect(connection.context.column.selected.id).toBe(70);
    expect(connection.context.columns[0].selected.id).toBe(70);
    expect(connection.contexts[1].columns[0].selected.id).toBe(70);
    // Previous item
    expect(connection.contexts[0].columns[0].selected.id).toBe(60);
  });

  test('creates the context and selects the item as specified', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    expect(connection.selected.id).toBe(60);
    expect(connection.selected.type).toBe('post');
    expect(connection.context.columns[3].selected.id).toBe(90);
    expect(connection.contexts[0].columns[3].items[2].id).toBe(99);
    expect(connection.selected.next.id).toBe(68);
    expect(connection.context.columns[2].selected.next.id).toBe(90);
    expect(connection.context.columns[3].selected.next.id).toBe(98);
  });

  test("changes selected when context exists and has 'selected' inside", () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90 }));
    expect(connection.selected.id).toBe(90);
    expect(connection.selected.type).toBe('post');
  });

  test("changes selected when contexts are equal and have 'selected' inside", () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90, context: context1 }));
    expect(connection.selected.id).toBe(90);
    expect(connection.selected.type).toBe('post');
    expect(connection.contexts.length).toBe(1);
  });

  test("Moves selected using replace when context exists and has 'selected' inside", () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 70, method: 'replace' }));
    expect(connection.selected.id).toBe(70);
    expect(connection.selected.type).toBe('post');
    expect(connection.selected.next.id).toBe(68);
    expect(connection.context.column.items[0].next.id).toBe(70);
    expect(connection.context.columns.length).toBe(3);
    expect(connection.context.column).toBe(connection.context.columns[0]);
    expect(connection.context.columns[0].items.length).toBe(2);
  });

  test('Replaces context using replace', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context2 }));
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      toList({ id: 'post', type: 'latest', method: 'replace', context: context3 }),
    );
    expect(connection.selected.id).toBe('post');
    expect(connection.selected.type).toBe('latest');
    expect(connection.contexts.length).toBe(1);
    expect(connection.context.column.items.length).toBe(2);
    expect(connection.selected.next.type).toBe('post');
  });

  test('Goes back and forward as expected', () => {
    // Init context and then changes selected in the current context
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90 }));
    expect(connection.contexts.length).toBe(1);

    // Creates a new context
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 190, context: contextEmpty }));
    expect(connection.contexts.length).toBe(2);
    expect(connection.context.index).toBe(1);
    expect(connection.selected.id).toBe(190);

    // Goes back
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90, method: 'back' }));
    expect(connection.contexts.length).toBe(2);
    expect(connection.context.index).toBe(0);
    expect(connection.selected.id).toBe(90);

    // Goes back again
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    expect(connection.context.index).toBe(0);
    expect(connection.selected.id).toBe(60);

    // Goes forward
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90, method: 'forward' }));
    expect(connection.context.index).toBe(0);
    expect(connection.selected.id).toBe(90);

    // Goes forward again
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      toPost({ id: 190, method: 'forward', context: contextEmpty }),
    );
    expect(connection.context.index).toBe(1);
    expect(connection.selected.id).toBe(190);
  });
});
