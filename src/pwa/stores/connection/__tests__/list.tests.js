/* eslint-disable dot-notation */
import { autorun } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import { list } from '../../../schemas';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';

const { entities: entitiesFromCategory7List } = normalize(postsFromCategory7, list);

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

let connection = null;
beforeEach(() => {
  connection = Connection.create({});
  unprotect(connection);
});

describe('Store › List', () => {
  test('Get list shape when entity is not ready', () => {
    expect(connection.list('category', 7).ready).toBe(false);
  });

});
