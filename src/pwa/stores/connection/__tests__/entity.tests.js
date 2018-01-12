/* eslint-disable no-restricted-syntax */
import { autorun } from 'mobx';
import { types, getSnapshot, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';
import post60 from '../../../__tests__/post-60.json';
import { entity } from '../../../schemas';
import convert from '../../../converters';

const { entities } = normalize(post60, entity);
const post60converted = convert(entities.single[60]);
const category3converted = convert(entities.taxonomy[3]);
const tag10converted = convert(entities.taxonomy[10]);
const media62converted = convert(entities.media[62]);

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
  test.only('Get entity shape when entity is not ready', () => {
    expect(connection.entity('someType', 'someId')).toMatchSnapshot();
  });

  test.only('Get single shape when entity is not ready', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('post', 60).title).toBe(null);
    expect(connection.entity('post', 60).taxonomies).toEqual([]);
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    expect(connection.entity('post', 60).featured.sizes).toEqual([]);
    expect(connection.entity('post', 60).author.name).toBe(null);
  });

  test.only('Get taxonomy shape when entity is not ready', () => {
    expect(connection.entity('category', 3).ready).toBe(false);
    expect(connection.entity('category', 3).name).toBe(null);
    expect(connection.entity('category', 3).link).toBe(null);
  });

  test.only('Get author shape when entity is not ready', () => {
    expect(connection.entity('author', 4).ready).toBe(false);
    expect(connection.entity('author', 4).name).toBe(null);
    expect(connection.entity('author', 4).avatar).toBe(null);
  });

  test.only('Get media shape when entity is not ready', () => {
    expect(connection.entity('media', 62).ready).toBe(false);
    expect(connection.entity('media', 62).link).toBe(null);
    expect(connection.entity('media', 62).author.name).toBe(null);
    expect(connection.entity('media', 62).original.height).toBe(null);
    expect(connection.entity('media', 62).sizes).toEqual([]);
  });

  test('Subscribe to single fields before entity is ready', done => {
    autorun(() => {
      if (connection.entity('post', 60).title === 'The Beauties of Gullfoss') done();
    });
    connection.entities.set('post_60', post60converted);
  });

  test('Access entity after adding real entity', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    connection.entities.get('post').put(post60converted);
    expect(connection.entity('post', 60).ready).toBe(true);
    expect(getSnapshot(connection.entity('post', 60).entity)).toMatchSnapshot();
  });


  test('Access post properties before ready', () => {
    expect(connection.entity('post', 60).title).toBe(null);
    expect(connection.entity('post', 60).creationDate).toBe(null);
    expect(connection.entity('post', 60).modificationDate).toBe(null);
    expect(connection.entity('post', 60).slug).toBe(null);
    expect(connection.entity('post', 60).link).toBe('/?p=60');
    expect(connection.entity('post', 60).content).toBe(null);
    expect(connection.entity('post', 60).excerpt).toBe(null);
  });

  test('Access post properties after they are ready', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    connection.entities.get('post').put(post60converted);
    expect(connection.entity('post', 60).ready).toBe(true);
    expect(connection.entity('post', 60).title).toBe(post60converted.title);
    expect(connection.entity('post', 60).creationDate).toEqual(
      new Date(post60converted.creationDate),
    );
    expect(connection.entity('post', 60).modificationDate).toEqual(
      new Date(post60converted.modificationDate),
    );
    expect(connection.entity('post', 60).slug).toBe(post60converted.slug);
    expect(connection.entity('post', 60).link).toBe(post60converted.link);
    expect(connection.entity('post', 60).content).toBe(post60converted.content);
    expect(connection.entity('post', 60).excerpt).toBe(post60converted.excerpt);
  });

  test('Access taxonomies array before ready', () => {
    expect(connection.entity('post', 60).taxonomies('category')).toEqual([]);
    expect(connection.entity('post', 60).taxonomies('tag')).toEqual([]);
  });

  test('Access taxonomies array after ready', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('category', 3).ready).toBe(false);
    expect(connection.entity('tag', 10).ready).toBe(false);
    connection.entities.get('post').put(post60converted);
    connection.entities.get('category').put(category3converted);
    connection.entities.get('tag').put(tag10converted);
    connection
      .entity('post', 60)
      .taxonomies('category')
      .map(category => {
        if (category.id === 3) {
          expect(category.ready).toBe(true);
          expect(category).toMatchSnapshot();
          expect(category.name).toBe('Photography');
        } else {
          expect(category.ready).toBe(false);
          expect(category.name).toBe(null);
        }
      });
    connection
      .entity('post', 60)
      .taxonomies('tag')
      .map(tag => {
        if (tag.id === 10) {
          expect(tag.ready).toBe(true);
          expect(tag).toMatchSnapshot();
          expect(tag.name).toBe('Gullfoss');
        } else {
          expect(tag.ready).toBe(false);
          expect(tag.name).toBe(null);
        }
      });
  });

  test('Subscribto to taxonomies array', done => {
    autorun(() => {
      for (const category of connection.entity('post', 60).taxonomies('category')) {
        if (category.name === 'Photography') done();
      }
    });
    connection.entities.get('post').put(post60converted);
    connection.entities.get('category').put(category3converted);
  });

  test('Featured ready', () => {
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    connection.entities.get('post').put(post60converted);
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    connection.entities.get('media').put(media62converted);
    expect(connection.entity('post', 60).featured.ready).toBe(true);
  });

  test('Featured ready upside down', () => {
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    connection.entities.get('media').put(media62converted);
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    connection.entities.get('post').put(post60converted);
    expect(connection.entity('post', 60).featured.ready).toBe(true);
  });

  test('Subscribe to featured ready', done => {
    autorun(() => {
      if (connection.entity('post', 60).featured.ready) done();
    });
    connection.entities.get('post').put(post60converted);
    connection.entities.get('media').put(media62converted);
  });

  test('Subscribe to featured original and sizes', done => {
    autorun(() => {
      if (
        connection.entity('post', 60).featured.original.width === 5000 &&
        connection.entity('post', 60).featured.sizes.length === 6
      )
        done();
    });
    connection.entities.get('post').put(post60converted);
    connection.entities.get('media').put(media62converted);
  });

  test('Other to featured properties', () => {
    connection.entities.get('post').put(post60converted);
    connection.entities.get('media').put(media62converted);
    expect(connection.entity('post', 60).featured.entity).toMatchSnapshot();
  });

  test('Access Media in a post before it is added', () => {
    connection.entities.set('post', {});
    connection.entities.get('post').put(post60converted);
    // connection.entity('media', 62);
    expect(connection.entity('post', 60).featured).toMatchSnapshot();
  });

  // test('Recognice a Custom Post Type before itself is added (by adding another previously)');
  // test('Recognice a Custom Taxonomy before itself is added (by adding another previously)');
  //
  // test('Add post. Request and succeed', () => {
  //   // const connection = Connection.create({});
  //   connection[actionTypes.SINGLE_REQUESTED](
  //     actions.singleRequested({
  //       singleType: 'post',
  //       singleId: 60,
  //     }),
  //   );
  //   expect(connection.entity('post', 60).fetching).toBe(true);
  //   expect(connection.entity('post', 60).ready).toBe(false);
  //   connection[actionTypes.SINGLE_SUCCEED](
  //     actions.singleSucceed({
  //       entities: post60normalized,
  //     }),
  //   );
  //   expect(connection.entity('post', 60).fetching).toBe(false);
  //   expect(connection.entity('post', 60).ready).toBe(true);
  //   expect(connection.entity('post', 60).title).toBe('The Beauties of Gullfoss');
  // });
  //
  // test('Add post. Request and fail.', () => {
  //   // const connection = Connection.create({});
  //   connection[actionTypes.SINGLE_REQUESTED](
  //     actions.singleRequested({
  //       singleType: 'post',
  //       singleId: 60,
  //     }),
  //   );
  //   expect(connection.entity('post', 60).fetching).toBe(true);
  //   expect(connection.entity('post', 60).ready).toBe(false);
  //   connection[actionTypes.SINGLE_FAILED](
  //     actions.singleFailed({
  //       singleType: 'post',
  //       singleId: 60,
  //       error: new Error('Something went wrong!'),
  //     }),
  //   );
  //   expect(connection.entity('post', 60).fetching).toBe(false);
  //   expect(connection.entity('post', 60).ready).toBe(false);
  // });
});
