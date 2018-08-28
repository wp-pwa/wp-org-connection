/* eslint-disable no-restricted-syntax, no-underscore-dangle */
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import post60 from '../../../__tests__/post-60.json';
import { entity } from '../../../schemas';

const { entities } = normalize(post60, entity);

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

const Stores = types.model().props({
  connection: types.optional(Connection, {}),
  build: types.optional(types.frozen, {
    initialUrl: 'https://www.example.com/some-post',
  }),
});

let stores = null;
let connection = null;
let initialSelectedItem;
beforeEach(() => {
  initialSelectedItem = {};
  stores = Stores.create({}, { initialSelectedItem });
  connection = stores.connection; // eslint-disable-line
  unprotect(stores);
});

describe('Connection › HeadMeta', () => {
  test('headMeta can be accessed when entity is not ready', () => {
    expect(connection.entity('post', 60).headMeta.title).toBe('');
    expect(connection.entity('post', 60).headMeta.pagedTitle(1)).toBe('');
  });
  test('headMeta can be accessed when entity is not ready and entity has been created', () => {
    connection.getEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).headMeta.title).toBe('');
    expect(connection.entity('post', 60).headMeta.pagedTitle(2)).toBe('');
  });
  test("title returns entity's title if head.title is not present", () => {
    Object.assign(initialSelectedItem, { type: 'post', id: 60 });
    connection.addEntity({ entity: entities.single[60] });
    connection.head.title = '';
    expect(connection.entity('post', 60).headMeta.title).toMatchSnapshot();
  });
  test("title returns entity's title when the entity does't match initialSelectedItem", () => {
    Object.assign(initialSelectedItem, { type: 'post', id: 54 });
    connection.addEntity({ entity: entities.single[60] });
    connection.head.title = 'Post 60 - Title from head';
    expect(connection.entity('post', 60).headMeta.title).toMatchSnapshot();
  });
  test('title returns head.title when the entity matchs initialSelectedItem', () => {
    Object.assign(initialSelectedItem, { type: 'post', id: 60 });
    connection.head.title = 'Post 60 - Title from head';
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).headMeta.title).toMatchSnapshot();
  });
  test('pagedTitle returns head.title when the entity matchs initialSelectedItem', () => {
    Object.assign(initialSelectedItem, { type: 'category', id: 3, page: 2 });
    connection.head.title = 'Category 3 - page 2 - Title from head';
    connection.addEntity({ entity: entities.taxonomy[3] });
    expect(
      connection.entity('category', 3).headMeta.pagedTitle(2),
    ).toMatchSnapshot();
  });
  test("pagedTitle returns entity's title if page doesn't match the initialSelectedItem's page", () => {
    Object.assign(initialSelectedItem, { type: 'category', id: 3, page: 2 });
    connection.head.title = 'Category 3 - page 2 - Title from head';
    connection.addEntity({ entity: entities.taxonomy[3] });
    expect(
      connection.entity('category', 3).headMeta.pagedTitle(3),
    ).toMatchSnapshot();
  });
});
