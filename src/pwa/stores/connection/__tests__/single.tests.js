import { autorun } from 'mobx';
import { types, applySnapshot } from 'mobx-state-tree';
import * as connect from '../';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';
import post60normalized from '../../../__tests__/post-60-normalized.json';

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

describe('Store › Single', () => {
  test('Access single without initializating', () => {
    const connection = Connection.create({});
    expect(connection.single('post', 60).title).toBe(null);
    expect(connection.single('post', 60).fetching).toBe(false);
    expect(connection.single('post', 60).ready).toBe(false);
  });

  test.only('Subscribe to single fields without initializating', done => {
    const connection = Connection.create({});
    autorun(() => {
      if (connection.single('post', 60).title) done();
    })
    connection[actionTypes.SINGLE_SUCCEED](actions.singleSucceed({
      entities: {
        'post': {
          60: {
            title: 'The Beauties of'
          }
        }
      }
    }))
  });

  test('Retrieve entity properties', () => {
    const connection = Connection.create({
      singleMap: {
        category: {
          7: {
            id: 7,
            name: 'Nature',
            slug: 'nature',
            taxonomy: 'category',
            _link: 'http://example.com/category/nature',
          },
        },
      },
    });
    expect(connection.single('category', 7)).toMatchSnapshot();
    applySnapshot(connection, {
      singleMap: {
        category: {
          7: {
            id: 7,
            name: 'New Nature',
            slug: 'nature',
            taxonomy: 'category',
            _link: 'http://example.com/category/nature',
          },
          8: {
            id: 8,
            name: 'Travel',
            slug: 'travel',
            taxonomy: 'category',
            _link: 'https://demo.worona.org/wp-cat/travel/',
          },
        },
        tag: {
          10: {
            id: 10,
            _link: 'https://demo.worona.org/tag/gullfoss/',
            name: 'Gullfoss',
            slug: 'gullfoss',
            taxonomy: 'tag',
          },
        },
      },
    });
    expect(connection.single('category', 7)).toMatchSnapshot();
    expect(connection.single('category', 8)).toMatchSnapshot();
    expect(connection.single('tag', 10)).toMatchSnapshot();
  });

  test('Retrieve nested entities', () => {
    const connection = Connection.create({
      singleMap: {
        category: {
          3: {
            id: 3,
            _link: 'https://demo.worona.org/wp-cat/photography/',
            name: 'Photography',
            slug: 'photography',
            taxonomy: 'category',
          },
          8: {
            id: 8,
            _link: 'https://demo.worona.org/wp-cat/travel/',
            name: 'Travel',
            slug: 'travel',
            taxonomy: 'category',
          },
        },
        tag: {
          10: {
            id: 10,
            _link: 'https://demo.worona.org/tag/gullfoss/',
            name: 'Gullfoss',
            slug: 'gullfoss',
            taxonomy: 'tag',
          },
        },
        media: {
          62: {
            id: 62,
            mimeType: 'image/jpeg',
            mediaType: 'image',
            title: 'iceland',
            original: {
              height: 123,
              width: 213,
              filename: '2016/11/Iceland-test.jpg',
              url: 'https://demo.worona.org/wp-content/uploads/2016/11/Iceland-test.jpg',
            },
            sizes: [
              {
                height: 123,
                width: 213,
                filename: '2016/11/Iceland-test.jpg',
                url: 'https://demo.worona.org/wp-content/uploads/2016/11/Iceland-test.jpg',
              },
              {
                height: 250,
                width: 350,
                filename: '2016/11/Iceland-test-250.jpg',
                url: 'https://demo.worona.org/wp-content/uploads/2016/11/Iceland-test-250.jpg',
              },
            ],
            creationDate: new Date('2016-11-25T18:33:33'),
            slug: 'iceland-test',
            _link: 'https://demo.worona.org/post-60-slug/iceland-test/',
            author: 2,
            alt: 'iceland',
          },
        },
        author: {
          4: {
            id: 4,
            name: 'Alan',
            slug: 'alan',
            description: 'Alan is a WordPress enthusiast who enjoys travelling, music and pizza.',
            _link: 'http://example.com/author/alan/',
          },
        },
        post: {
          60: {
            id: 60,
            creationDate: new Date('2016-11-25T18:31:11'),
            modificationDate: new Date('2017-10-02T14:23:48'),
            title: 'Post 60',
            slug: 'post-60-slug',
            type: 'post',
            _link: 'http://example.com/post-60-slug/',
            content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
            author: 4,
            featured: 62,
            taxonomiesMap: {
              category: [3, 8],
              tag: [10],
            },
          },
        },
      },
    });
    expect(connection.single('post', 60)).toMatchSnapshot();
  });

  test('Add post. Request and succeed', () => {
    const connection = Connection.create({});
    connection[actionTypes.SINGLE_REQUESTED](
      actions.singleRequested({
        singleType: 'post',
        singleId: 60,
      }),
    );
    expect(connection.single('post', 60).fetching).toBe(true);
    expect(connection.single('post', 60).ready).toBe(false);
    connection[actionTypes.SINGLE_SUCCEED](
      actions.singleSucceed({
        entities: post60normalized,
      }),
    );
    expect(connection.single('post', 60).fetching).toBe(false);
    expect(connection.single('post', 60).ready).toBe(true);
    expect(connection.single('post', 60).title).toBe('The Beauties of Gullfoss');
  });

  test('Add post. Request and fail.', () => {
    const connection = Connection.create({});
    connection[actionTypes.SINGLE_REQUESTED](
      actions.singleRequested({
        singleType: 'post',
        singleId: 60,
      }),
    );
    expect(connection.single('post', 60).fetching).toBe(true);
    expect(connection.single('post', 60).ready).toBe(false);
    connection[actionTypes.SINGLE_FAILED](
      actions.singleFailed({
        singleType: 'post',
        singleId: 60,
        error: new Error('Something went wrong!'),
      }),
    );
    expect(connection.single('post', 60).fetching).toBe(false);
    expect(connection.single('post', 60).ready).toBe(false);
  });
});
