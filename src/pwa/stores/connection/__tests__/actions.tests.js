/* eslint-disable no-restricted-syntax, no-underscore-dangle */
import { types } from 'mobx-state-tree';
import * as connect from '../';
import WpApi from '../../../env/wpapi';
import post60 from '../../../__tests__/post-60.json';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
import postsFromCategory7Page2 from '../../../__tests__/posts-from-category-7-page-2.json';

jest.mock('../../../env/wpapi');

postsFromCategory7._paging = { total: 15, totalPages: 3 };
postsFromCategory7Page2._paging = { total: 15, totalPages: 3 };

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

const Stores = types.model().props({
  connection: types.optional(Connection, {}),
  settings: types.frozen({
    connection: {},
    generalSite: { url: 'https://example.com' },
  }),
  build: types.frozen({ perPage: 10 }),
});

let connection = null;
let getEntity = null;
let getListPage = null;
let getCustomPage = null;

beforeEach(() => {
  WpApi.mockClear();
  connection = Stores.create({}, { connection: { WpApi } }).connection; // eslint-disable-line
  connection.initApi();
  ({ getEntity, getListPage, getCustomPage } = WpApi.mock.instances[0]); // eslint-disable-line
});

describe('Connection › Actions', () => {
  test('Entity: Fetching Succeed', async () => {
    getEntity.mockReturnValueOnce(Promise.resolve(post60));
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(false);
    const fetchPromise = connection.fetchEntity({ type: 'post', id: 60 });
    expect(getEntity).toBeCalledWith({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(true);
    await fetchPromise;
    expect(connection.entity('post', 60).isReady).toBe(true);
    expect(connection.entity('post', 60).title).toBe(
      'The Beauties of Gullfoss',
    );
    expect(connection.entity('media', 62).title).toBe('iceland');
    expect(connection.entity('author', 4).name).toBe('Alan Martin');
  });

  test('Entity: Fetching Failed', async () => {
    getEntity.mockReturnValueOnce(Promise.reject());
    await connection.fetchEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(false);
    expect(connection.entity('post', 60).hasFailed).toBe(true);
  });

  test('Entity: Not refetching if ready', async () => {
    getEntity.mockReturnValueOnce(Promise.resolve(post60));
    await connection.fetchEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isReady).toBe(true);
    await connection.fetchEntity({ type: 'post', id: 60 });
    expect(getEntity.mock.calls).toHaveLength(1);
  });

  test('Entity: Refetching if force is true', async () => {
    getEntity.mockReturnValue(Promise.resolve(post60));
    await connection.fetchEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isReady).toBe(true);
    await connection.fetchEntity({ type: 'post', id: 60, force: true });
    expect(getEntity.mock.calls).toHaveLength(2);
  });

  test('List: Fetching Succeed', async () => {
    getListPage.mockReturnValueOnce(Promise.resolve(postsFromCategory7));
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    const fetchPromise = connection.fetchListPage({
      type: 'category',
      id: 7,
      page: 1,
    });
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(true);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(true);
    await fetchPromise;
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(true);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).total.pages).toBe(3);
    expect(connection.list('category', 7).total.entities).toBe(15);
    expect(connection.list('category', 7).total.fetched.pages).toBe(1);
    expect(connection.list('category', 7).total.fetched.entities).toBe(5);
    expect(connection.list('category', 7).page(1).total).toBe(5);
  });

  test('List: Fetching Succeed with 2 pages (reverse order)', async () => {
    getListPage
      .mockReturnValueOnce(Promise.resolve(postsFromCategory7Page2))
      .mockReturnValueOnce(Promise.resolve(postsFromCategory7));
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(false);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
    const fetchPromise2 = connection.fetchListPage({
      type: 'category',
      id: 7,
      page: 2,
    });
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(true);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(false);
    expect(connection.list('category', 7).page(2).isFetching).toBe(true);
    await fetchPromise2;
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(true);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
    const fetchPromise1 = connection.fetchListPage({
      type: 'category',
      id: 7,
      page: 1,
    });
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(true);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(true);
    expect(connection.list('category', 7).page(2).isReady).toBe(true);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
    await fetchPromise1;
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(true);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(true);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
  });

  test('List: Action Failed', async () => {
    getListPage.mockReturnValueOnce(Promise.reject());
    await connection.fetchListPage({ type: 'category', id: 7, page: 1 });
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
  });

  test('List: Not refetching if ready', async () => {
    getListPage.mockReturnValueOnce(Promise.resolve(postsFromCategory7));
    await connection.fetchListPage({ type: 'category', id: 7, page: 1 });
    expect(connection.list('category', 7).page(1).isReady).toBe(true);
    await connection.fetchListPage({ type: 'category', id: 7, page: 1 });
    expect(getListPage.mock.calls).toHaveLength(1);
  });

  test('List: Refetching if force is true', async () => {
    getListPage.mockReturnValue(Promise.resolve(postsFromCategory7));
    await connection.fetchListPage({ type: 'category', id: 7, page: 1 });
    expect(connection.list('category', 7).page(1).isReady).toBe(true);
    await connection.fetchListPage({
      type: 'category',
      id: 7,
      page: 1,
      force: true,
    });
    expect(getListPage.mock.calls).toHaveLength(2);
  });

  test('Custom: Fetching Succeed', async () => {
    getCustomPage.mockReturnValue(Promise.resolve(postsFromCategory7));
    expect(connection.custom('test').isReady).toBe(false);
    expect(connection.custom('test').isFetching).toBe(false);
    expect(connection.custom('test').page(1).isReady).toBe(false);
    expect(connection.custom('test').page(1).isFetching).toBe(false);
    const params = { a: 'b' };
    const fetchPromise = connection.fetchCustomPage({
      name: 'test',
      page: 1,
      type: 'post',
      params,
      url: '/#test',
    });
    expect(connection.custom('test').isReady).toBe(false);
    expect(connection.custom('test').isFetching).toBe(true);
    expect(connection.custom('test').params).toEqual(params);
    expect(connection.custom('test').url).toBe('/#test');
    expect(connection.custom('test').page(1).isReady).toBe(false);
    expect(connection.custom('test').page(1).isFetching).toBe(true);
    await fetchPromise;
    expect(connection.custom('test').isReady).toBe(true);
    expect(connection.custom('test').isFetching).toBe(false);
    expect(connection.custom('test').page(1).isReady).toBe(true);
    expect(connection.custom('test').page(1).isFetching).toBe(false);
  });

  test('Custom: Fetching Failed', async () => {
    getCustomPage.mockReturnValue(Promise.reject());
    const params = { a: 'b' };
    await connection.fetchCustomPage({
      name: 'test',
      page: 1,
      type: 'post',
      params,
      url: '/#test',
    });
    expect(connection.custom('test').isReady).toBe(false);
    expect(connection.custom('test').isFetching).toBe(false);
    expect(connection.custom('test').page(1).isReady).toBe(false);
    expect(connection.custom('test').page(1).isFetching).toBe(false);
  });
});
