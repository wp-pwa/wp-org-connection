import { getSnapshot } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import Conn from '../../';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
import postsFromCategory7Page2 from '../../../__tests__/posts-from-category-7-page-2.json';
import post60 from '../../../__tests__/post-60.json';
import { list, entity } from '../../../schemas';
import { actions as historyActions } from '../history';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';

const { entities: entitiesFromPost60 } = normalize(post60, entity);

const { result: resultFromCategory7, entities: entitiesFromCategory } = normalize(
  postsFromCategory7,
  list,
);

const { result: resultFromCategory7Page2, entities: entitiesFromCategoryPage2 } = normalize(
  postsFromCategory7Page2,
  list,
);

const post60Succeed = actions.entitySucceed({
  entity: { type: 'post', id: 60 },
  entities: entitiesFromPost60,
});

const category7Page1Succeed = actions.listSucceed({
  list: { type: 'category', id: 7, page: 1 },
  result: resultFromCategory7,
  entities: entitiesFromCategory,
});

const category7Page2Succeed = actions.listSucceed({
  list: { type: 'category', id: 7, page: 1 },
  result: resultFromCategory7Page2,
  entities: entitiesFromCategoryPage2,
});

const post60routeChangeRequested = (method = 'push') => actions.routeChangeRequested({
  selectedItem: { type: 'post', id: 60 },
  context: { columns: [[{ type: 'post', id: 60 }]] },
  method,
});

// Adds history actions to Connection model.
const Connection = Conn.actions(historyActions);

// Returns a snapshot as the initial state.
const initialStateMock = () => {
  const store = Connection.create({});
  store[actionTypes.ENTITY_SUCCEED](post60Succeed);
  store[actionTypes.ROUTE_CHANGE_SUCCEED](post60routeChangeRequested());
  return getSnapshot(store);
};

// Tests
describe('Connection › Router > History', () => {
  test('initializes blank if not populated', () => {
    const store = Connection.create({});
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('initializes url if populated', () => {
    const store = Connection.create(initialStateMock());
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
  });

  test("dispatchs succeed when 'push' (history length increases)", () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });
    store[actionTypes.ENTITY_SUCCEED](post60Succeed);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](post60routeChangeRequested());
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(2);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test("dispatchs succeed when 'replace' (same history length)", () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });
    store[actionTypes.ENTITY_SUCCEED](post60Succeed);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](post60routeChangeRequested('replace'));
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test('does not dispatch a succeed when just updating the url', () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });

    store[actionTypes.ROUTE_CHANGE_REQUESTED](post60routeChangeRequested());
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[0]);

    let { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(2);
    expect(dispatch.mock.calls.length).toBe(1);

    store[actionTypes.ENTITY_SUCCEED](post60Succeed);

    ({ key, ...rest } = store.history.location);
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(2);
    expect(dispatch.mock.calls.length).toBe(1);
  });

  test('backward');
  test('Forward');
  test('go to previous context');
});
