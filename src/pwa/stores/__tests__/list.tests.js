/* eslint-disable dot-notation */
import Connection from '../';
import * as actions from '../../actions';
import * as actionTypes from '../../actionTypes';
import post60normalized from '../../__tests__/post-60-normalized.json';
import category7normalized from '../../__tests__/category-7-normalized.json';

test('Check lists totals', () => {
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
  expect(connection.list.category[7].total.fetched).toBe(6);
});

test('Add list. Request and succeed', () => {
  const connection = Connection.create({});
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'category',
    listId: 7,
    page: 3
  }));
  expect(connection.list.category[7].total.fetched).toBe(0);
  expect(connection.list.category[7].fetching).toBe(true);
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].page[2].fetching).toBe(true);
  expect(connection.list.category[7].page[2].ready).toBe(false);
  connection[actionTypes.LIST_SUCCEED](actions.listSucceed({
    listType: 'category',
    listId: 7,
    page: 3,
    result: [60],
    total: {
      entities: 250,
      pages: 25,
    },
    entities: {
      post: {
        60: post60normalized.post[60],
      },
      category: {
        7: category7normalized.taxonomy[7],
      },
    },
  }));
  expect(connection.list.category[7].fetching).toBe(false);
  expect(connection.list.category[7].ready).toBe(true);
  expect(connection.list.category[7].page[2].fetching).toBe(false);
  expect(connection.list.category[7].page[2].ready).toBe(true);
  expect(connection.list.category[7].entities[0].title).toBe('The Beauties of Gullfoss');
  expect(connection.list.category[7].page[2].entities[0].title).toBe('The Beauties of Gullfoss');
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'category',
    listId: 7,
    page: 3
  }));
  expect(connection.list.category[7].fetching).toBe(true);
  expect(connection.list.category[7].ready).toBe(true);
  expect(connection.list.category[7].page[2].fetching).toBe(true);
  expect(connection.list.category[7].page[2].ready).toBe(true);
});

test('Add list. Request and fail.', () => {
  const connection = Connection.create({});
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'category',
    listId: 7,
    page: 25
  }));
  expect(connection.list.category[7].fetching).toBe(true);
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].page[24].fetching).toBe(true);
  expect(connection.list.category[7].page[24].ready).toBe(false);
  connection[actionTypes.LIST_FAILED](actions.listRequested({
    listType: 'category',
    listId: 7,
    page: 25,
    error: new Error('Something went wrong!'),
  }));
  expect(connection.list.category[7].fetching).toBe(false);
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].page[24].fetching).toBe(false);
  expect(connection.list.category[7].page[24].ready).toBe(false);
});

test('Add latest. Request and succeed', () => {
  const connection = Connection.create({});
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'latest',
  }));
  expect(connection.list.latest.post.fetching).toBe(true);
  expect(connection.list.latest.post.ready).toBe(false);
  expect(connection.list.latest.post.page[0].fetching).toBe(true);
  expect(connection.list.latest.post.page[0].ready).toBe(false);

  connection[actionTypes.LIST_SUCCEED](actions.listSucceed({
    listType: 'latest',
    page: 1,
    result: [60],
    total: {
      entities: 250,
      pages: 25,
    },
    entities: {
      post: {
        60: post60normalized.post[60],
      },
      category: {
        7: category7normalized.taxonomy[7],
      },
    },
  }));
  expect(connection.list.latest.post.fetching).toBe(false);
  expect(connection.list.latest.post.ready).toBe(true);
  expect(connection.list.latest.post.page[0].fetching).toBe(false);
  expect(connection.list.latest.post.page[0].ready).toBe(true);
  expect(connection.list.latest.post.entities[0].title).toBe('The Beauties of Gullfoss');
  expect(connection.list.latest.post.page[0].entities[0].title).toBe('The Beauties of Gullfoss');
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'latest',
  }));
  expect(connection.list.latest.post.fetching).toBe(true);
  expect(connection.list.latest.post.ready).toBe(true);
  expect(connection.list.latest.post.page[0].fetching).toBe(true);
  expect(connection.list.latest.post.page[0].ready).toBe(true);
});

test('Add latest movies. Request and succeed', () => {
  const connection = Connection.create({});
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'latest',
    listId: 'movie'
  }));
  expect(connection.list.latest.movie.fetching).toBe(true);
  expect(connection.list.latest.movie.ready).toBe(false);
  expect(connection.list.latest.movie.page[0].fetching).toBe(true);
  expect(connection.list.latest.movie.page[0].ready).toBe(false);

  connection[actionTypes.LIST_SUCCEED](actions.listSucceed({
    listType: 'latest',
    listId: 'movie',
    page: 1,
    result: [60],
    total: {
      entities: 250,
      pages: 25,
    },
    entities: {
      movie: {
        60: post60normalized.post[60],
      },
      category: {
        7: category7normalized.taxonomy[7],
      },
    },
  }));
  expect(connection.list.latest.movie.fetching).toBe(false);
  expect(connection.list.latest.movie.ready).toBe(true);
  expect(connection.list.latest.movie.page[0].fetching).toBe(false);
  expect(connection.list.latest.movie.page[0].ready).toBe(true);
  expect(connection.list.latest.movie.entities[0].title).toBe('The Beauties of Gullfoss');
  expect(connection.list.latest.movie.page[0].entities[0].title).toBe('The Beauties of Gullfoss');
  connection[actionTypes.LIST_REQUESTED](actions.listRequested({
    listType: 'latest',
    listId: 'movie',
  }));
  expect(connection.list.latest.movie.fetching).toBe(true);
  expect(connection.list.latest.movie.ready).toBe(true);
  expect(connection.list.latest.movie.page[0].fetching).toBe(true);
  expect(connection.list.latest.movie.page[0].ready).toBe(true);
});
