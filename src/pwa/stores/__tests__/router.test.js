import { getSnapshot, applySnapshot } from 'mobx-state-tree';
import Connection from '../';
import * as actionTypes from '../../actionTypes';
import * as actions from '../../actions';
import post60 from '../../__tests__/post-60-converted.json';

let store;
beforeEach(() => {
  store = Connection.create();
});

test('Initializates empty', () => {
  expect(getSnapshot(store.contexts)).toEqual([]);
  expect(store.context).toBe(null);
});

test('Creates a new context from selected post', () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
    }),
  );

  expect(store.selected.type).toBe('post');
  expect(store.selected.id).toBe(60);
  expect(store.context.index).toBe(0);
  expect(store.context.column.selected.id).toBe(60);
  expect(store.context.columns[0].selected.id).toBe(60);
  expect(store.context.columns[0].items[0].id).toBe(60);
  expect(store.contexts[0].columns[0].items[0].id).toBe(60);
  expect(store.contexts[0].columns[0].selected.id).toBe(60);
  expect(store.contexts[0].columns[0].selected.column._id).toBe(store.contexts[0].columns[0]._id);
});

test('Creates a new context from selected list', () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { listType: 'category', listId: 7 },
    }),
  );

  expect(store.selected.type).toBe('category');
  expect(store.selected.id).toBe(7);
  expect(store.selected.page).toBe(1);
  expect(store.context.index).toBe(0);
  expect(store.context.column.selected.id).toBe(7);
  expect(store.context.columns[0].selected.id).toBe(7);
  expect(store.context.columns[0].items[0].id).toBe(7);
  expect(store.contexts[0].columns[0].items[0].id).toBe(7);
  expect(store.contexts[0].columns[0].selected.id).toBe(7);
  expect(store.contexts[0].columns[0].selected.column._id).toBe(store.contexts[0].columns[0]._id);
});

test('Creates another context from selected', () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
    }),
  );

  expect(store.context.getItem({ singleType: 'post', singleId: 70 })).toBe(null);

  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 70 },
    }),
  );

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

test('Creates the context and selects the item as specified', () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
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
      },
    }),
  );

  expect(store.selected.id).toBe(60);
  expect(store.selected.type).toBe('post');
  expect(store.context.columns[3].selected.id).toBe(90);
  expect(store.contexts[0].columns[3].items[2].id).toBe(99);
  expect(store.selected.next.id).toBe(68);
  expect(store.context.columns[2].selected.next.id).toBe(90);
  expect(store.context.columns[3].selected.next.id).toBe(98);
});

test("Changes selected when context exists and has 'selected' inside", () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
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
      },
    }),
  );

  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 90 },
    }),
  );

  expect(store.selected.id).toBe(90);
  expect(store.selected.type).toBe('post');
});

test("Changes selected when contexts are equal and have 'selected' inside", () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
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
      },
    }),
  );

  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 90 },
      context: {
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
      },
    }),
  );

  expect(store.selected.id).toBe(90);
  expect(store.selected.type).toBe('post');
  expect(store.contexts.length).toBe(1);
});

test("Moves selected using replace when context exists and has 'selected' inside", () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
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
      },
    }),
  );

  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 70 },
      method: 'replace',
    }),
  );

  expect(store.selected.id).toBe(70);
  expect(store.selected.type).toBe('post');
  expect(store.selected.next.id).toBe(68);
  expect(store.context.column.items[0].next.id).toBe(70);
  expect(store.context.columns.length).toBe(3);
  expect(store.context.column._id).toBe(store.context.columns[0]._id);
  expect(store.context.columns[0].items.length).toBe(2);
});

test('Replaces context using replace', () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
        items: [
          [{ singleType: 'post', singleId: 60 }, { listType: 'latest', listId: 'post' }],
          { listType: 'category', listId: 12 },
          { listType: 'category', listId: 13 },
          { listType: 'category', listId: 14 },
          { listType: 'category', listId: 20 },
          { listType: 'category', listId: 22 },
        ],
      },
    }),
  );

  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      method: 'replace',
      selected: { listType: 'latest', listId: 'post' },
      context: {
        items: [
          [{ singleType: 'post', singleId: 60 }, { listType: 'latest', listId: 'post' }],
          { singleType: 'post', singleId: 68 },
          { singleType: 'post', singleId: 70 },
          { singleType: 'post', singleId: 90 },
          { singleType: 'post', singleId: 98 },
          { singleType: 'post', singleId: 99 },
        ],
      },
    }),
  );

  expect(store.selected.id).toBe('post');
  expect(store.selected.type).toBe('latest');
  expect(store.contexts.length).toBe(1);
  expect(store.context.column.items.length).toBe(2);
  expect(store.selected.next.type).toBe('post');
});

test('Goes back and forward as expected', () => {
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
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
      },
    }),
  );

  // Changes selected in the current context
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 90 },
    }),
  );

  expect(store.contexts.length).toBe(1);

  // Creates a new context
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 190 },
    }),
  );

  expect(store.contexts.length).toBe(2);
  expect(store.context.index).toBe(1);
  expect(store.selected.id).toBe(190);

  // Goes back
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 90 },
      method: 'back',
    }),
  );

  expect(store.contexts.length).toBe(2);
  expect(store.context.index).toBe(0);
  expect(store.selected.id).toBe(90);

  // Goes back again
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
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
      },
    }),
  );

  expect(store.context.index).toBe(0);
  expect(store.selected.id).toBe(60);

  // Goes forward
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 90 },
      method: 'forward',
    }),
  );

  expect(store.context.index).toBe(0);
  expect(store.selected.id).toBe(90);

  // Goes forward again
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 190 },
      method: 'forward',
    }),
  );

  expect(store.context.index).toBe(1);
  expect(store.selected.id).toBe(190);
});

test('List with extract=true should be extracted even when they are not in the store', async () => {
  const fromListExpected = ({ listType, listId, page }) => item => {
    expect(item.listType).toBe(listType);
    expect(item.listId).toBe(listId);
    expect(item.page).toBe(page);
  };

  applySnapshot(store, {
    listMap: {
      category: {
        7: {
          total: {
            entities: 17,
            pages: 5,
          },
          pageMap: {
            0: {
              entities: [60, 61, 62, 63],
            },
            1: {
              entities: [64, 65, 66],
            },
          },
        },
      },
    },
    singleMap: {
      post: {
        60: { type: 'post', id: 60 },
        61: { type: 'post', id: 61 },
        62: { type: 'post', id: 62 },
        63: { type: 'post', id: 63 },
        64: { type: 'post', id: 64 },
        65: { type: 'post', id: 65 },
        66: { type: 'post', id: 66 },
      },
      category: {
        7: { type: 'category', id: 7 },
      },
    },
  });

  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
        items: [
          { singleType: 'post', singleId: 60 },
          { singleType: 'post', singleId: 68 },
          { singleType: 'post', singleId: 70 },
          { listType: 'category', listId: 11, extract: true },
          { listType: 'category', listId: 7, extract: true },
        ],
      },
    }),
  );

  const lengthCat11p1 = store.siteInfo.perPage;
  const lengthCat7p1 = store.list.category[7].page[0].total;

  store.context.columns
    .filter((c, i) => i === 3)
    .map(c => c.items[0].fromList)
    .forEach(fromListExpected({ listType: 'category', listId: 11, page: 1 }));

  store.context.columns
    .filter((c, i) => i > 3)
    .map(c => c.items[0].fromList)
    .forEach(fromListExpected({ listType: 'category', listId: 7, page: 1 }));

  expect(store.context.columns.length).toBe(3 + lengthCat7p1);

  expect(store.context.columns[3].items[0].id).toBe(null);
  expect(store.context.columns[4].items[0].id).toBe(61);
  expect(store.context.columns[6].items[0].id).toBe(63);

  // ----------------- List received ----------------- //

  const result = Array(lengthCat11p1)
    .fill(0)
    .map((e, i) => 60 + i);

  const post = result.reduce((all, id) => {
    all[id] = Object.assign({}, post60, { id });
    return all;
  }, {});

  store[actionTypes.LIST_REQUESTED]({
    listType: 'category',
    listId: 11,
    page: 1,
  });

  store[actionTypes.LIST_SUCCEED](
    actions.listSucceed({
      listType: 'category',
      listId: 11,
      page: 1,
      result,
      total: {
        entities: 250,
        pages: 25,
      },
      entities: {
        post,
      },
    }),
  );

  store.context.columns
    .filter((c, i) => i >= 3 && i < 3 + lengthCat11p1 - 1)
    .map(c => c.items[0].fromList)
    .forEach(fromListExpected({ listType: 'category', listId: 11, page: 1 }));

  store.context.columns
    .filter((c, i) => i >= 3 + lengthCat11p1 - 1)
    .map(c => c.items[0].fromList)
    .forEach(fromListExpected({ listType: 'category', listId: 7, page: 1 }));

  expect(store.context.columns.length).toBe(1 + lengthCat11p1);
});
