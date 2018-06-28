import { types, getSnapshot } from 'mobx-state-tree';
import Connection from '../../';
import WpApi from '../../../env/wpapi';
import post60 from '../../../__tests__/post-60.json';

jest.mock('../../../env/wpapi');

const Stores = types.model().props({
  connection: types.optional(Connection, {}),
  settings: types.optional(types.frozen, {
    connection: {},
    generalSite: { url: 'https://example.com' },
  }),
  build: types.optional(types.frozen, { perPage: 10 }),
});

let connection = null;
let getEntity = null;

beforeEach(() => {
  WpApi.mockClear();
  connection = Stores.create({}, { connection: { WpApi } }).connection; // eslint-disable-line
  connection.initApi();
  getEntity = WpApi.mock.instances[0].getEntity; // eslint-disable-line
});

describe('Connection › Router > History', () => {
  test('initializes the url if selectedItem exists in the initial state', async () => {
    // Returns a snapshot as the initial state.
    const initialStateMock = async () => {
      getEntity.mockReturnValueOnce(Promise.resolve(post60));
      await connection.fetchEntity({ type: 'post', id: 60 });
      connection.routeChangeRequested({
        selectedItem: { type: 'post', id: 60 },
      });
      return getSnapshot(connection);
    };

    const store = Connection.create(await initialStateMock());
    store.replaceFirstUrl();
    const { key, ...rest } = store.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('replaces the first blank url if selectedItem is not null anymore', async () => {
    getEntity.mockReturnValueOnce(Promise.resolve(post60));
    connection.replaceFirstUrl();
    await connection.fetchEntity({ type: 'post', id: 60 });
    connection.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } });
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history).toHaveLength(1);
  });

  test("dispatchs succeed when 'push' (history length increases)", async () => {
    getEntity.mockReturnValueOnce(Promise.resolve(post60));
    await connection.fetchEntity({ type: 'post', id: 60 });
    connection.routeChangeSucceed({ selectedItem: { type: 'post', id: 63 } });
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(),
    });
    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 60 } });
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history).toHaveLength(2);
    expect(connection.routeChangeSucceed.mock.calls).toHaveLength(1);

    const action = connection.routeChangeSucceed.mock.calls[0][0];
    expect(action).toMatchSnapshot();
  });

  test("dispatchs succeed when 'replace' (same history length)", async () => {
    getEntity.mockReturnValueOnce(Promise.resolve(post60));
    await connection.fetchEntity({ type: 'post', id: 60 });

    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(),
    });
    connection.routeChangeRequested({
      selectedItem: { type: 'post', id: 60 },
      method: 'replace',
    });

    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history).toHaveLength(1);
    expect(connection.routeChangeSucceed.mock.calls).toHaveLength(1);

    const action = connection.routeChangeSucceed.mock.calls[0][0];
    expect(action).toMatchSnapshot();
  });

  test('does not dispatch a succeed when just updating the url', async () => {
    getEntity.mockReturnValueOnce(Promise.resolve(post60));

    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 60 } });

    let { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history).toHaveLength(2);

    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(),
    });

    await connection.fetchEntity({ type: 'post', id: 60 });

    ({ key, ...rest } = connection.history.location);
    expect(rest).toMatchSnapshot();
    expect(connection.history).toHaveLength(2);
    expect(connection.routeChangeSucceed.mock.calls).toHaveLength(0);
  });

  test('goes backward', async () => {
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(connection.routeChangeSucceed),
    });

    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 60 } });
    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 63 } });

    expect(connection.history).toHaveLength(3);

    connection.history.goBack();

    const { pathname, search } = connection.history.location;
    expect(pathname + search).toBe('/?p=60');
    expect(connection.history).toHaveLength(3);

    const actionBackward = connection.routeChangeSucceed.mock.calls[2][0];
    expect(actionBackward.method).toBe('backward');
  });

  test('goes forward', async () => {
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(connection.routeChangeSucceed),
    });

    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 60 } });
    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 63 } });

    expect(connection.history).toHaveLength(3);

    connection.history.goBack();
    connection.history.goForward();

    const { pathname, search } = connection.history.location;
    expect(pathname + search).toBe('/?p=63');
    expect(connection.history).toHaveLength(3);

    const actionForward = connection.routeChangeSucceed.mock.calls[3][0];
    expect(actionForward.method).toBe('forward');
  });

  test('goes to previous context', async () => {
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(connection.routeChangeSucceed),
    });

    const context = {
      columns: [[{ type: 'media', id: 193 }], [{ type: 'media', id: 190 }]],
    };

    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 63 } });
    connection.routeChangeRequested({
      selectedItem: { type: 'media', id: 193 },
      context,
    });
    connection.routeChangeRequested({
      selectedItem: { type: 'media', id: 190 },
      context,
    });

    expect(connection.history).toHaveLength(4);

    connection.previousContextRequested();

    const { pathname, search } = connection.history.location;
    expect(pathname + search).toBe('/?p=63');
    expect(connection.history).toHaveLength(4);

    const actionPreviousContext =
      connection.routeChangeSucceed.mock.calls[3][0];
    expect(actionPreviousContext.method).toBe('backward');
  });

  test('goes to previous context after replace', async () => {
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(connection.routeChangeSucceed),
    });

    const context = {
      columns: [[{ type: 'media', id: 193 }], [{ type: 'media', id: 190 }]],
    };

    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 63 } });
    connection.routeChangeRequested({
      selectedItem: { type: 'post', id: 60 },
      method: 'replace',
    });
    connection.routeChangeRequested({
      selectedItem: { type: 'media', id: 193 },
      context,
    });
    connection.routeChangeRequested({
      selectedItem: { type: 'media', id: 190 },
      context,
    });

    expect(connection.history).toHaveLength(4);

    connection.previousContextRequested();
    const { pathname, search } = connection.history.location;
    expect(pathname + search).toBe('/?p=60');
    expect(connection.history).toHaveLength(4);

    const actionPreviousContext =
      connection.routeChangeSucceed.mock.calls[4][0];
    expect(actionPreviousContext.method).toBe('backward');
  });

  test('goes to previous context twice', async () => {
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(connection.routeChangeSucceed),
    });

    const context = {
      columns: [[{ type: 'media', id: 193 }]],
    };

    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 63 } });
    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 60 } });
    connection.routeChangeRequested({
      selectedItem: { type: 'media', id: 193 },
      context,
    });

    expect(connection.history).toHaveLength(4);

    connection.previousContextRequested();

    const {
      pathname: pathname60,
      search: search60,
    } = connection.history.location;
    expect(pathname60 + search60).toBe('/?p=60');
    expect(connection.history).toHaveLength(4);

    const actionContextPost60 = connection.routeChangeSucceed.mock.calls[3][0];
    expect(actionContextPost60.method).toBe('backward');

    connection.previousContextRequested();
    const {
      pathname: pathname63,
      search: search63,
    } = connection.history.location;
    expect(pathname63 + search63).toBe('/?p=63');
    expect(connection.history).toHaveLength(4);

    const actionContextPost63 = connection.routeChangeSucceed.mock.calls[4][0];
    expect(actionContextPost63.method).toBe('backward');
  });

  test('goes to previous context twice after a route change', async () => {
    Object.defineProperty(connection, 'routeChangeSucceed', {
      writeable: true,
      value: jest.fn(connection.routeChangeSucceed),
    });

    const listContext = {
      columns: [
        [{ type: 'latest', id: 'posts', page: 1 }],
        [{ type: 'category', id: 18, page: 1 }],
      ],
    };

    const galleryContext = {
      columns: [[{ type: 'media', id: 193 }]],
    };

    connection.routeChangeRequested({
      selectedItem: { type: 'latest', id: 'post', page: 1 },
      context: listContext,
    });
    connection.routeChangeRequested({
      selectedItem: { type: 'category', id: 18, page: 1 },
    });
    connection.routeChangeRequested({ selectedItem: { type: 'post', id: 63 } });
    connection.routeChangeRequested({
      selectedItem: { type: 'media', id: 193 },
      context: galleryContext,
    });

    expect(connection.history).toHaveLength(5);

    connection.previousContextRequested();
    const {
      pathname: pathnamePost63,
      search: searchPost63,
    } = connection.history.location;
    expect(pathnamePost63 + searchPost63).toBe('/?p=63');
    expect(connection.history).toHaveLength(5);

    const actionContextPost63 = connection.routeChangeSucceed.mock.calls[4][0];
    expect(actionContextPost63.method).toBe('backward');

    connection.previousContextRequested();
    const {
      pathname: pathnameCat18,
      search: searchCat18,
    } = connection.history.location;
    expect(pathnameCat18 + searchCat18).toBe('/?cat=18');
    expect(connection.history).toHaveLength(5);

    const actionContextCat18 = connection.routeChangeSucceed.mock.calls[5][0];
    expect(actionContextCat18.method).toBe('backward');
  });
});
