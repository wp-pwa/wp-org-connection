import Connection from '../';
import * as actions from '../../actions';
import * as actionTypes from '../../actionTypes';

const snapshot = {
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
  customMap: {
    category: {
      7: {
        total: {
          entities: 16,
          pages: 8,
        },
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
};

const snap = {
  customMap: {
    name: {
      total: { entities: 1, pages: 1, fetched: 1 },
      pageMap: {
        0: {
          entities: [1, 2, 3],
        },
      },
    },
  },
};

test('Check Custom totals', () => {
  const connection = Connection.create(snapshot);
  expect(connection.custom.category[7].total.entities).toBe(16);
  expect(connection.custom.category[7].total.fetched).toBe(6);
  expect(connection.custom.category[7].total.pages).toBe(8);
  expect(connection.custom.category[7].page[0].total).toBe(2);
  expect(connection.custom.category[7].page[1].total).toBe(2);
  expect(connection.custom.category[7].page[8].total).toBe(2);
});

test('Get list items', () => {
  const connection = Connection.create(snapshot);
  expect(connection.custom.category[7].page[0].entities[1].title).toBe('Post 61');
  expect(connection.custom.category[7].page[1].entities[0].title).toBe('Post 62');
  expect(connection.custom.category[7].page[8].entities[1].title).toBe('Post 63');
  expect(connection.custom.category[7].entities[1].title).toBe('Post 61');
  expect(connection.custom.category[7].entities[5].title).toBe('Post 63');
});

test('Check CUSTOM_REQUESTED action', () => {
  const connection = Connection.create({});
  connection[actionTypes.CUSTOM_REQUESTED](
    actions.customRequested({
      url: '/pepe',
      name: 'customTest',
      singleType: 'category',
      page: 0,
      params: {},
    }),
  );
});
