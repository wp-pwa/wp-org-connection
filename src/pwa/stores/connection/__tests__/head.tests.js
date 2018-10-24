/* eslint-disable no-restricted-syntax, no-underscore-dangle */
import { types, unprotect } from 'mobx-state-tree';
import path from 'path';
import { readFileSync } from 'fs';
import * as connect from '../';
import headActions from '../head/actions';

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions)
  .actions(headActions);

const Stores = types.model().props({
  connection: types.optional(Connection, {}),
  build: types.frozen({
    initialUrl: 'https://www.example.com/some-post',
  }),
});

describe('Connection › Head', () => {
  test('should fail if initialUrl is not set', async () => {
    const stores = Stores.create({});
    unprotect(stores);
    stores.build = {};
    stores.connection.fetchHeadContent();
    expect(stores.connection.head.hasFailed).toBe(true);
  });
  test('should populate <title>', async () => {
    const html = { text: '<head><title>Hi!</title></head>' };
    const stores = Stores.create(
      {},
      { request: jest.fn().mockReturnValue(Promise.resolve(html)) },
    );
    await stores.connection.fetchHeadContent();
    expect(stores.connection.head.hasFailed).toBe(false);
    expect(stores.connection.head.title).toBe('Hi!');
  });
  test('should populate content', async () => {
    const html = {
      text: readFileSync(path.resolve(__dirname, 'html-for-head.html'), 'utf8'),
    };
    const stores = Stores.create(
      {},
      { request: jest.fn().mockReturnValue(Promise.resolve(html)) },
    );
    await stores.connection.fetchHeadContent();
    expect(stores.connection.head.hasFailed).toBe(false);
    expect(stores.connection.head.content).toMatchSnapshot();
  });
});
