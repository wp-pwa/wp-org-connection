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

const routeRequest = (type, id, method, context) => actions.routeChangeRequested({
  selectedItem: { type, id },
  context: context || { columns: [[{ type, id }]] },
  method,
});

describe('Connection › Router > History', () => {
  test('initializes blank if not populated', () => {
    const store = Connection.create({});
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('initializes the url if populated', () => {
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

  test("dispatchs succeed when 'push' (history length increases)", () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });
    store[actionTypes.ENTITY_SUCCEED](post60Succeed);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
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
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'replace'));
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
    expect(store.history.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test('does not dispatch a succeed when just updating the url', () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
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

  test('goes backward', () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[0]);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[1]);
    expect(store.history.length).toBe(3);

    store.history.goBack();
    const { pathname, search } = store.history.location;
    expect(pathname + search).toBe('/?p=60');
    expect(store.history.length).toBe(3);
    expect(dispatch.mock.calls[2][0].method).toBe('backward');
  });

  test('goes forward', () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 60, 'push'));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[0]);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[1]);
    expect(store.history.length).toBe(3);

    store.history.goBack();
    store.history.goForward();
    const { pathname, search } = store.history.location;
    expect(pathname + search).toBe('/?p=63');
    expect(store.history.length).toBe(3);
    expect(dispatch.mock.calls[3][0].method).toBe('forward');
  });

  test('goes to previous context', () => {
    const dispatch = jest.fn();
    const store = Connection.create({}, { dispatch });
    const galleryContext = {
      columns: [
        [{ type: 'media', id: 193 }],
        [{ type: 'media', id: 190 }],
      ],
    };

    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('post', 63, 'push'));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[0]);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('media', 193, 'push', galleryContext));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[1]);
    store[actionTypes.ROUTE_CHANGE_REQUESTED](routeRequest('media', 190, 'push', galleryContext));
    store[actionTypes.ROUTE_CHANGE_SUCCEED](...dispatch.mock.calls[2]);
    expect(store.history.length).toBe(4);

    store[actionTypes.PREVIOUS_CONTEXT_REQUESTED]({});
    const { pathname, search } = store.history.location;
    expect(pathname + search).toBe('/?p=63');
    expect(store.history.length).toBe(4);
    expect(dispatch.mock.calls[3][0].method).toBe('backward');
  });
});
