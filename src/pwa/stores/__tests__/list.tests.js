import Connection from '../connection';
import * as actionTypes from '../../actionTypes';

test.skip('Check lists totals', () => {
  const connection = Connection.create({
    listMap: {
      category: {
        7: {
          total: {
            entities: 17,
            pages: 5
          },
          pageMap: {
            0: {
              entities: [60, 61, 62, 63],
            },
            1: {
              entities: [64, 65, 66],
            },
          },
        },
      },
    },
  });
  expect(connection.list.category[7].page[0].total).toBe(4);
  expect(connection.list.category[7].page[1].total).toBe(3);
  expect(connection.list.category[7].total.entities).toBe(17);
  expect(connection.list.category[7].total.pages).toBe(5);
});

test.skip('Retrieve list items', () => {
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
          pageMap: {
            0: {
              entities: [60, 61],
            },
            1: {
              entities: [62, 63],
            },
            8: {
              entities: [60, 63],
            },
          },
        },
      },
    },
  });
  expect(connection.list.category[7].page[0].entities[1].title).toBe('Post 61');
  expect(connection.list.category[7].page[1].entities[0].title).toBe('Post 62');
  expect(connection.list.category[7].page[8].entities[1].title).toBe('Post 63');
  expect(connection.list.category[7].entities[1].title).toBe('Post 61');
});

test.skip('Add list. Request and succeed', () => {
  const connection = Connection.create({});
  connection[actionTypes.LIST_REQUESTED]({
    listType: 'category',
    listId: 7,
    page: 3,
  });
  expect(connection.list.category[7].fetching).toBe(true);
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].page[3].fetching).toBe(true);
  expect(connection.list.category[7].page[3].ready).toBe(false);
  connection[actionTypes.LIST_SUCCEED]({
    listType: 'category',
    listId: 7,
    page: 3,
    results: [60],
    total: {
      entities: 250,
      pages: 25,
    },
    entities: {
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
          taxonomies: {
            category: [7],
          },
        },
      },
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
  expect(connection.list.category[7].fetching).toBe(false);
  expect(connection.list.category[7].ready).toBe(true);
  expect(connection.list.category[7].page[3].fetching).toBe(false);
  expect(connection.list.category[7].page[3].ready).toBe(true);
  expect(connection.list.category[7].entities[0].title).toBe('Post 60');
  expect(connection.list.category[7].page[3].entities[0].title).toBe('Post 60');
  connection[actionTypes.LIST_REQUESTED]({
    listType: 'category',
    listId: 7,
    page: 3,
  });
  expect(connection.list.category[7].fetching).toBe(true);
  expect(connection.list.category[7].ready).toBe(true);
  expect(connection.list.category[7].page[3].fetching).toBe(true);
  expect(connection.list.category[7].page[3].ready).toBe(true);
});

test.skip('Add list. Request and fail.', () => {
  const connection = Connection.create({});
  connection[actionTypes.LIST_REQUESTED]({
    listType: 'category',
    listId: 7,
    page: 25,
  });
  expect(connection.list.category[7].fetching).toBe(true);
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].page[25].fetching).toBe(true);
  expect(connection.list.category[7].page[25].ready).toBe(false);
  connection[actionTypes.LIST_FAILED]({
    listType: 'category',
    listId: 7,
    page: 25,
    error: new Error('Something went wrong!'),
  });
  expect(connection.list.category[7].fetching).toBe(false);
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].page[25].fetching).toBe(false);
  expect(connection.list.category[7].page[25].ready).toBe(false);
});
