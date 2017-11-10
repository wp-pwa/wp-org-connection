import { applySnapshot } from 'mobx-state-tree';
import Connection from '../connection';

test('Check if lists are ready', () => {
  const connection = Connection.create({
    listMap: { category: { 7: { page: [{ fetching: true }] } } },
  });
  expect(connection.list.category[7].page[0].ready).toBe(false);
  expect(connection.list.category[7].ready).toBe(false);
  applySnapshot(connection, {
    singleMap: {
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
        },
      },
    },
    listMap: {
      category: {
        7: {
          page: [
            {
              entities: [60],
            },
          ],
        },
      },
    },
  });
  expect(connection.list.category[7].page[0].ready).toBe(true);
  expect(connection.list.category[7].page[0].total).toBe(1);
  expect(connection.list.category[7].ready).toBe(true);
});

test('Retrieve list items', () => {
  const connection = Connection.create({
    singleMap: {
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
        },
        61: {
          id: 61,
          creationDate: new Date('2016-11-25T18:31:11'),
          modificationDate: new Date('2017-10-02T14:23:48'),
          title: 'Post 61',
          slug: 'post-61-slug',
          type: 'post',
          link: 'http://example.com/post-61-slug/',
          content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
          author: 4,
        },
        62: {
          id: 62,
          creationDate: new Date('2016-11-25T18:31:11'),
          modificationDate: new Date('2017-10-02T14:23:48'),
          title: 'Post 62',
          slug: 'post-62-slug',
          type: 'post',
          link: 'http://example.com/post-62-slug/',
          content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
          author: 4,
        },
        63: {
          id: 63,
          creationDate: new Date('2016-11-25T18:31:11'),
          modificationDate: new Date('2017-10-02T14:23:48'),
          title: 'Post 63',
          slug: 'post-63-slug',
          type: 'post',
          link: 'http://example.com/post-63-slug/',
          content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
          author: 4,
        },
      },
    },
    listMap: {
      category: {
        7: {
          page: [
            {
              entities: [60, 61],
            },
            {
              entities: [62, 63],
            },
          ],
        },
      },
    },
  });
  expect(connection.list.category[7].page[0].entities[1].title).toBe('Post 61');
  expect(connection.list.category[7].page[1].entities[0].title).toBe('Post 62');
  expect(connection.list.category[7].entities[1].title).toBe('Post 61');
});
