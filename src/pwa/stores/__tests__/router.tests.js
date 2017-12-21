import Connection from '../';
import * as actionTypes from '../../actionTypes';
import * as actions from '../../actions';

describe('Router', () => {
  let store;
  beforeEach(() => {
    // Restart store for each test
    store = Connection.create();
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

  const contextEmpty = {
    infinite: false,
    items: [],
  };

  test('initializes empty', () => {
    expect(store.contexts).toMatchSnapshot();
    expect(store.context).toBeNull();
  });

  test('creates a new context from selected post', () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60 }));
    expect(store.selected.type).toBe('post');
    expect(store.selected.id).toBe(60);
    expect(store.context.index).toBe(0);
    expect(store.context.column.selected.id).toBe(60);
    expect(store.context.columns[0].selected.id).toBe(60);
    expect(store.context.columns[0].items[0].id).toBe(60);
    expect(store.contexts[0].columns[0].items[0].id).toBe(60);
    expect(store.contexts[0].columns[0].selected.id).toBe(60);
    expect(store.contexts[0].columns[0].selected.column).toBe(store.contexts[0].columns[0]);
  });

  test('creates a new context from selected list', () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toList({ id: 7 }));
    expect(store.selected.type).toBe('category');
    expect(store.selected.id).toBe(7);
    expect(store.selected.page).toBe(1);
    expect(store.context.index).toBe(0);
    expect(store.context.column.selected.id).toBe(7);
    expect(store.context.columns[0].selected.id).toBe(7);
    expect(store.context.columns[0].items[0].id).toBe(7);
    expect(store.contexts[0].columns[0].items[0].id).toBe(7);
    expect(store.contexts[0].columns[0].selected.id).toBe(7);
    expect(store.contexts[0].columns[0].selected.column).toBe(store.contexts[0].columns[0]);
  });

  test('creates another context from selected', () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60 }));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 70 }));
    // Current item
    expect(store.context.index).toBe(1);
    expect(store.selected.id).toBe(70);
    expect(store.selected.type).toBe('post');
    expect(store.context.column.selected.id).toBe(70);
    expect(store.context.columns[0].selected.id).toBe(70);
    expect(store.context.columns[0].items[0].id).toBe(70);
    expect(store.contexts[1].columns[0].items[0].id).toBe(70);
    expect(store.contexts[1].columns[0].selected.id).toBe(70);
    // Previous item
    expect(store.contexts[0].columns[0].items[0].id).toBe(60);
    expect(store.contexts[0].columns[0].selected.id).toBe(60);
  });

  test('creates the context and selects the item as specified', () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    expect(store.selected.id).toBe(60);
    expect(store.selected.type).toBe('post');
    expect(store.context.columns[3].selected.id).toBe(90);
    expect(store.contexts[0].columns[3].items[2].id).toBe(99);
    expect(store.selected.next.id).toBe(68);
    expect(store.context.columns[2].selected.next.id).toBe(90);
    expect(store.context.columns[3].selected.next.id).toBe(98);
  });

  test("changes selected when context exists and has 'selected' inside", () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90 }));
    expect(store.selected.id).toBe(90);
    expect(store.selected.type).toBe('post');
  });

  test("changes selected when contexts are equal and have 'selected' inside", () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90, context: context1 }));
    expect(store.selected.id).toBe(90);
    expect(store.selected.type).toBe('post');
    expect(store.contexts.length).toBe(1);
  });

  test("Moves selected using replace when context exists and has 'selected' inside", () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 70, method: 'replace' }));
    expect(store.selected.id).toBe(70);
    expect(store.selected.type).toBe('post');
    expect(store.selected.next.id).toBe(68);
    expect(store.context.column.items[0].next.id).toBe(70);
    expect(store.context.columns.length).toBe(3);
    expect(store.context.column._id).toBe(store.context.columns[0]._id);
    expect(store.context.columns[0].items.length).toBe(2);
  });

  test('Replaces context using replace', () => {
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context2 }));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](
      toList({ id: 'post', type: 'latest', method: 'replace', context: context3 }),
    );
    expect(store.selected.id).toBe('post');
    expect(store.selected.type).toBe('latest');
    expect(store.contexts.length).toBe(1);
    expect(store.context.column.items.length).toBe(2);
    expect(store.selected.next.type).toBe('post');
  });

  test('Goes back and forward as expected', () => {
    // Init context
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    // Changes selected in the current context
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90 }));
    expect(store.contexts.length).toBe(1);

    // Creates a new context
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 190, context: contextEmpty }));
    expect(store.contexts.length).toBe(2);
    expect(store.context.index).toBe(1);
    expect(store.selected.id).toBe(190);

    // Goes back
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90, method: 'back' }));
    expect(store.contexts.length).toBe(2);
    expect(store.context.index).toBe(0);
    expect(store.selected.id).toBe(90);

    // Goes back again
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 60, context: context1 }));
    expect(store.context.index).toBe(0);
    expect(store.selected.id).toBe(60);

    // Goes forward
    store[actionTypes.ROUTE_CHANGE_SUCCEED](toPost({ id: 90, method: 'forward' }));
    expect(store.context.index).toBe(0);
    expect(store.selected.id).toBe(90);

    // Goes forward again
    store[actionTypes.ROUTE_CHANGE_SUCCEED](
      toPost({ id: 190, method: 'forward', context: contextEmpty }),
    );
    expect(store.context.index).toBe(1);
    expect(store.selected.id).toBe(190);
  });
});
