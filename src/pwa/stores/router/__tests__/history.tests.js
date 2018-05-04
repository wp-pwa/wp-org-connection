import { getSnapshot } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import Connection from '../../';
import post60 from '../../../__tests__/post-60.json';
import { entity } from '../../../schemas';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';

const { entities: entitiesFromPost60 } = normalize(post60, entity);

const post60Succeed = actions.entitySucceed({
  entity: { type: 'post', id: 60 },
  entities: entitiesFromPost60,
});

const routeRequest = (type, id, method, context) =>
  actions.routeChangeRequested({
    selectedItem: { type, id },
    context: context || { columns: [[{ type, id }]] },
    method,
  });

let redux;

beforeEach(() => {
  redux = { dispatch: jest.fn(), subscribe: jest.fn(), getState: jest.fn() };
})

describe('Connection › Router > History', () => {
  test('initializes the url if selectedItem exists in the initial state', () => {
    // Returns a snapshot as the initial state.
    const initialStateMock = () => {
      const store = Connection.create({});
      store[actionTypes.ENTITY_SUCCEED](post60Succeed);
      store[actionTypes.ROUTE_CHANGE_SUCCEED](routeRequest('post', 60, 'push'));
      return getSnapshot(store);
    };

    const store = Connection.create(initialStateMock());
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('replaces the first blank url if selectedItem is not null anymore', () => {
    const store = Connection.create({});
    store[actionTypes.ENTITY_SUCCEED](post60Succeed);
    store[actionTypes.ROUTE_CHANGE_SUCCEED](routeRequest('post', 60, 'push'));
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(1);
  });

  test("dispatchs succeed when 'push' (history length increases)", async () => {
    const store = Connection.create({}, { store: redux });
    store[actionTypes.ENTITY_SUCCEED](post60Succeed);
    store[actionTypes.ROUTE_CHANGE_SUCCEED](routeRequest('post', 63, 'push'));
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(2);
    expect(redux.dispatch.mock.calls.length).toBe(1);

    const action = redux.dispatch.mock.calls[0][0];
    expect(action).toMatchSnapshot();
  });

  test("dispatchs succeed when 'replace' (same history length)", async () => {
    const store = Connection.create({}, { store: redux });
    store[actionTypes.ENTITY_SUCCEED](post60Succeed);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'replace'));
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(1);
    expect(redux.dispatch.mock.calls.length).toBe(1);

    const action = redux.dispatch.mock.calls[0][0];
    expect(action).toMatchSnapshot();
  });

  test('does not dispatch a succeed when just updating the url', async () => {
    const store = Connection.create({}, { store: redux });

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));

    const action = redux.dispatch.mock.calls[0][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](action);

    let { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(2);
    expect(redux.dispatch.mock.calls.length).toBe(1);

    store[actionTypes.ENTITY_SUCCEED](post60Succeed);



    ({ key, ...rest } = store.history.location);
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(2);
    expect(redux.dispatch.mock.calls.length).toBe(1);
  });

  test('goes backward', async () => {
    const store = Connection.create({}, { store: redux });

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
    const succeedPost60 = redux.dispatch.mock.calls[0][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost60);

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    const succeedPost63 = redux.dispatch.mock.calls[1][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost63);

    expect(store.history.length).toBe(3);

    store.history.goBack();

    const { pathname, search } = store.history.location;
    expect(pathname + search).toBe('/?p=60');
    expect(store.history.length).toBe(3);

    const actionBackward = redux.dispatch.mock.calls[2][0];
    expect(actionBackward.method).toBe('backward');
  });

  test('goes forward', async () => {
    const store = Connection.create({}, { store: redux });

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
    const succeedPost60 = redux.dispatch.mock.calls[0][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost60);

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    const succeedPost63 = redux.dispatch.mock.calls[1][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost63);

    expect(store.history.length).toBe(3);

    store.history.goBack();
    store.history.goForward();

    const { pathname, search } = store.history.location;
    expect(pathname + search).toBe('/?p=63');
    expect(store.history.length).toBe(3);

    const actionForward = redux.dispatch.mock.calls[3][0];
    expect(actionForward.method).toBe('forward');
  });

  test('goes to previous context', async () => {
    const store = Connection.create({}, { store: redux });

    const galleryContext = {
      columns: [[{ type: 'media', id: 193 }], [{ type: 'media', id: 190 }]],
    };

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    const succeedPost60 = redux.dispatch.mock.calls[0][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost60);

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('media', 193, 'push', galleryContext));
    const succeedMedia193 = redux.dispatch.mock.calls[1][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedMedia193);

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('media', 190, 'push', galleryContext));
    const succeedMedia190 = redux.dispatch.mock.calls[2][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedMedia190);

    expect(store.history.length).toBe(4);

    store[actionTypes.PREVIOUS_CONTEXT_REQUESTED]({});
    const { pathname, search } = store.history.location;
    expect(pathname + search).toBe('/?p=63');
    expect(store.history.length).toBe(4);

    const actionPreviousContext = redux.dispatch.mock.calls[3][0];
    expect(actionPreviousContext.method).toBe('backward');
  });

  test('goes to previous context twice', async () => {
    const store = Connection.create({}, { store: redux });

    const galleryContext = {
      columns: [[{ type: 'media', id: 193 }]],
    };

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    const succeedPost63 = redux.dispatch.mock.calls[0][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost63);

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
    const succeedPost60 = redux.dispatch.mock.calls[1][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedPost60);

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('media', 193, 'push', galleryContext));
    const succeedMedia193 = redux.dispatch.mock.calls[2][0];
    store[actionTypes.ROUTE_CHANGE_SUCCEED](succeedMedia193);

    expect(store.history.length).toBe(4);

    store[actionTypes.PREVIOUS_CONTEXT_REQUESTED]({});
    const { pathname: pathname60, search: search60 } = store.history.location;
    expect(pathname60 + search60).toBe('/?p=60');
    expect(store.history.length).toBe(4);

    const actionContextPost60 = redux.dispatch.mock.calls[3][0];
    expect(actionContextPost60.method).toBe('backward');

    store[actionTypes.PREVIOUS_CONTEXT_REQUESTED]({});
    const { pathname: pathname63, search: search63 } = store.history.location;
    expect(pathname63 + search63).toBe('/?p=63');
    expect(store.history.length).toBe(4);

    const actionContextPost63 = redux.dispatch.mock.calls[4][0];
    expect(actionContextPost63.method).toBe('backward');
  });
});
