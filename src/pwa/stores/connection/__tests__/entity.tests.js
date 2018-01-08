import { autorun } from 'mobx';
import { types, applySnapshot, getSnapshot, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';
import post60 from '../../../__tests__/post-60.json';
import { entity } from '../../../schemas';
import convert from '../../../converters';

const { entities } = normalize(post60, entity);
const post60converted = convert(entities.single[60]);

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

describe('Store › Entity', () => {
  test.only('Access entity without initializating', () => {
    expect(getSnapshot(connection.entity('post', 60))).toMatchSnapshot();
    expect(connection.entity('post', 60).title).toBe(null);
    expect(connection.entity('post', 60).entity).toEqual({});
    expect(connection.entity('post', 60).ready).toBe(false);
  });
  test.only('Access entity after adding real entity', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    connection.entities.get('post').put(post60converted);
    expect(connection.entity('post', 60).ready).toBe(true);
    expect(getSnapshot(connection.entity('post', 60).entity)).toMatchSnapshot();
  });

  test.only('Subscribe to single fields without initializating', done => {
    autorun(() => {
      if (connection.entity('post', 60).title === 'The Beauties of Gullfoss') done();
    });
    connection.entities.get('post').put(post60converted);
  });

  test.only('Access post properties before ready', () => {
    expect(connection.entity('post', 60).title).toBe(null);
    expect(connection.entity('post', 60).creationDate).toBe(null);
    expect(connection.entity('post', 60).modificationDate).toBe(null);
    expect(connection.entity('post', 60).slug).toBe(null);
    expect(connection.entity('post', 60).link).toBe('/');
    expect(connection.entity('post', 60).content).toBe(null);
    expect(connection.entity('post', 60).excerpt).toBe(null);
  });

  test('Recognice a Custom Post Type before itself is added (by adding another previously)')
  test('Recognice a Custom Taxonomy before itself is added (by adding another previously)')

  test('Add post. Request and succeed', () => {
    // const connection = Connection.create({});
    connection[actionTypes.SINGLE_REQUESTED](
      actions.singleRequested({
        singleType: 'post',
        singleId: 60,
      }),
    );
    expect(connection.entity('post', 60).fetching).toBe(true);
    expect(connection.entity('post', 60).ready).toBe(false);
    connection[actionTypes.SINGLE_SUCCEED](
      actions.singleSucceed({
        entities: post60normalized,
      }),
    );
    expect(connection.entity('post', 60).fetching).toBe(false);
    expect(connection.entity('post', 60).ready).toBe(true);
    expect(connection.entity('post', 60).title).toBe('The Beauties of Gullfoss');
  });

  test('Add post. Request and fail.', () => {
    // const connection = Connection.create({});
    connection[actionTypes.SINGLE_REQUESTED](
      actions.singleRequested({
        singleType: 'post',
        singleId: 60,
      }),
    );
    expect(connection.entity('post', 60).fetching).toBe(true);
    expect(connection.entity('post', 60).ready).toBe(false);
    connection[actionTypes.SINGLE_FAILED](
      actions.singleFailed({
        singleType: 'post',
        singleId: 60,
        error: new Error('Something went wrong!'),
      }),
    );
    expect(connection.entity('post', 60).fetching).toBe(false);
    expect(connection.entity('post', 60).ready).toBe(false);
  });
});
