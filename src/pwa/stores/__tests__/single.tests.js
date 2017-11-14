import { applySnapshot } from 'mobx-state-tree';
import Connection from '../connection';
import * as actionTypes from '../../actionTypes';

test('Retrieve entity properties', () => {
  const connection = Connection.create({
    singleMap: {
      category: {
        7: {
          id: 7,
          name: 'Nature',
          slug: 'nature',
          taxonomy: 'category',
          link: 'http://example.com/category/nature',
        },
      },
    },
  });
  expect(connection.single.category[7].name).toBe('Nature');
  applySnapshot(connection, {
    singleMap: {
      category: {
        7: {
          id: 7,
          name: 'New Nature',
          slug: 'nature',
          taxonomy: 'category',
          link: 'http://example.com/category/nature',
        },
        8: {
          id: 8,
          name: 'Travel',
          slug: 'travel',
          taxonomy: 'category',
          link: 'https://demo.worona.org/wp-cat/travel/',
        },
      },
      tag: {
        10: {
          id: 10,
          link: 'https://demo.worona.org/tag/gullfoss/',
          name: 'Gullfoss',
          slug: 'gullfoss',
          taxonomy: 'tag',
        },
      },
    },
  });
  expect(connection.single.category[7].name).toBe('New Nature');
  expect(connection.single.category[8].slug).toBe('travel');
  expect(connection.single.tag[10].name).toBe('Gullfoss');
});

test('Retrieve nested entities', () => {
  const connection = Connection.create({
    singleMap: {
      category: {
        3: {
          id: 3,
          link: 'https://demo.worona.org/wp-cat/photography/',
          name: 'Photography',
          slug: 'photography',
          taxonomy: 'category',
        },
        8: {
          id: 8,
          link: 'https://demo.worona.org/wp-cat/travel/',
          name: 'Travel',
          slug: 'travel',
          taxonomy: 'category',
        },
      },
      tag: {
        10: {
          id: 10,
          link: 'https://demo.worona.org/tag/gullfoss/',
          name: 'Gullfoss',
          slug: 'gullfoss',
          type: 'tag',
        },
      },
      media: {
        62: {
          id: 62,
          mimeType: 'image/jpeg',
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
          link: 'https://demo.worona.org/post-60-slug/iceland-test/',
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
          link: 'http://example.com/author/alan/',
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
          link: 'http://example.com/post-60-slug/',
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
  expect(connection.single.post[60].author.name).toBe('Alan');
  expect(connection.single.post[60].taxonomies.category[0].name).toBe('Photography');
  expect(connection.single.post[60].featured.original.height).toBe(123);
  expect(connection.single.post[60].featured.sizes[1].height).toBe(250);
});

test('Add post. Request and succeed', () => {
  const connection = Connection.create({});
  connection[actionTypes.SINGLE_REQUESTED]({
    singleType: 'post',
    singleId: 60,
  });
  expect(connection.single.post[60].fetching).toBe(true);
  expect(connection.single.post[60].ready).toBe(false);
  connection[actionTypes.SINGLE_SUCCEED]({
    entity: {
      id: 60,
      creationDate: new Date('2016-11-25T18:31:11'),
      modificationDate: new Date('2017-10-02T14:23:48'),
      title: 'Post 60',
      slug: 'post-60-slug',
      type: 'post',
      link: 'http://example.com/post-60-slug/',
      content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
      author: 4,
      featured: 62,
      taxonomiesMap: {
        category: [3, 8],
        tag: [10],
      },
    },
  });
  expect(connection.single.post[60].fetching).toBe(false);
  expect(connection.single.post[60].ready).toBe(true);
  expect(connection.single.post[60].title).toBe('Post 60');
});

test('Add post. Request and fail.', () => {
  const connection = Connection.create({});
  connection[actionTypes.SINGLE_REQUESTED]({
    singleType: 'post',
    singleId: 60,
  });
  expect(connection.single.post[60].fetching).toBe(true);
  expect(connection.single.post[60].ready).toBe(false);
  connection[actionTypes.SINGLE_FAILED]({
    singleType: 'post',
    singleId: 60,
    error: new Error('Something went wrong!'),
  });
  expect(connection.single.post[60].fetching).toBe(false);
  expect(connection.single.post[60].ready).toBe(false);
});
