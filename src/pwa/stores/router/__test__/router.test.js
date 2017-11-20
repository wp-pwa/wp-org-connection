import { getSnapshot } from 'mobx-state-tree';

import Router from '../router';

import * as actionTypes from '../../../actionTypes';
import * as actions from '../../../actions';

test('Initializates empty', () => {
  const store = Router.create();
  expect(getSnapshot(store.contexts)).toEqual([]);
  expect(store.context).toBe(null);
});

test('Creates a new context from selected post', () => {
  const store = Router.create();
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
  const store = Router.create();
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
  const store = Router.create();
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
  const store = Router.create();
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
  const store = Router.create();
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
  const store = Router.create();
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
  const store = Router.create();
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

test("Replaces context using replace", () => {
  const store = Router.create();
  store[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selected: { singleType: 'post', singleId: 60 },
      context: {
        items: [
          [
            { singleType: 'post', singleId: 60 },
            { listType: 'latest' },
          ],
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
      selected: { listType: 'latest' },
      context: {
        items: [
          [
            { singleType: 'post', singleId: 60 },
            { listType: 'latest' },
          ],
          { singleType: 'post', singleId: 68 },
          { singleType: 'post', singleId: 70 },
          { singleType: 'post', singleId: 90 },
          { singleType: 'post', singleId: 98 },
          { singleType: 'post', singleId: 99 },
        ],
      },
    }),
  );

  expect(store.selected.id).toBe(null);
  expect(store.selected.type).toBe('latest');
  expect(store.contexts.length).toBe(1);
  expect(store.context.column.items.length).toBe(2);
  expect(store.selected.next.type).toBe('post');
});
