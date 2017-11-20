import { getSnapshot } from 'mobx-state-tree';
import Router from '../router';

import * as actionTypes from '../../../actionTypes'
import * as actions from '../../../actions'

test('Initializates empty', () => {
  const store = Router.create();
  expect(getSnapshot(store.contexts)).toEqual([]);
  expect(store.context).toBe(null);
})

test('Creates a new context from selected post', () => {
  const store = Router.create();
  store[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { singleType: 'post', singleId: 60 },
  }))

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
  store[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { listType: 'category', listId: 7 },
  }))

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
  store[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { singleType: 'post', singleId: 60 },
  }))

  expect(store.context.getItem({ singleType: 'post', singleId: 70 })).toBe(null);

  store[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { singleType: 'post', singleId: 70 },
  }))

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
