import { types } from 'mobx-state-tree';

import * as connect from '../';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

const snapshot = {
  singleMap: {
    category: {
      1: {
        id: 1,
        name: 'Weekend Trip',
        slug: 'weekend-trip',
        taxonomy: 'category',
        _link: 'http://example.com/category/weekend-trip',
      },
      3: {
        id: 3,
        name: 'Photography',
        slug: 'photography',
        taxonomy: 'category',
        _link: 'http://example.com/category/photography',
      },
      4: {
        id: 4,
        name: 'Cities',
        slug: 'cities',
        taxonomy: 'category',
        _link: 'http://example.com/category/cities',
      },
      5: {
        id: 5,
        name: 'Architecture',
        slug: 'architecture',
        taxonomy: 'category',
        _link: 'http://example.com/category/architecture',
      },
      6: {
        id: 6,
        name: 'Culture',
        slug: 'culture',
        taxonomy: 'category',
        _link: 'http://example.com/category/culture',
      },
      7: {
        id: 7,
        name: 'Nature',
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
  },
  customMap: {
    test1: {
      url: '/pepe',
      params: {},
      total: {
        entities: 16,
        pages: 8,
      },
      pageMap: {
        0: {
          entities: [1, 3],
        },
        1: {
          entities: [4, 5],
        },
        7: {
          entities: [6, 7],
        },
      },
    },
    test2: {
      url: '/papa',
      total: {
        entities: 12,
        pages: 2,
      },
      pageMap: {
        0: {
          entities: [1, 3, 4, 5],
        },
        1: {
          entities: [6, 7, 8],
        },
      },
    },
  },
};

describe('Store › Custom', () => {
  test('Check custom and page totals', () => {
    const connection = Connection.create(snapshot);
    expect(connection.custom.test1).toMatchSnapshot();
    expect(connection.custom.test2).toMatchSnapshot();

    // Views
    expect(connection.custom.test1.page[0].total).toBe(2);
    expect(connection.custom.test1.page[1].total).toBe(2);
    expect(connection.custom.test1.page[7].total).toBe(2);
    expect(connection.custom.test2.page[0].total).toBe(4);
    expect(connection.custom.test2.page[1].total).toBe(3);

    expect(connection.custom.test1.total.fetched.entities).toBe(6);
    expect(connection.custom.test1.total.fetched.pages).toBe(8);
    expect(connection.custom.test2.total.fetched.entities).toBe(7);
    expect(connection.custom.test2.total.fetched.pages).toBe(2);
  });

  test('Check entities and page entities names', () => {
    const connection = Connection.create(snapshot);
    const testEntities = ({ entities }) => entities.forEach(e => expect(e).toMatchSnapshot());

    testEntities(connection.custom.test1);
    testEntities(connection.custom.test2);

    testEntities(connection.custom.test1.page[0]);
    testEntities(connection.custom.test1.page[7]);
    testEntities(connection.custom.test2.page[0]);
    testEntities(connection.custom.test2.page[1]);
  });

  test('Check CUSTOM_REQUESTED action', () => {
    const connection = Connection.create({});
    connection[actionTypes.CUSTOM_REQUESTED](
      actions.customRequested({
        url: '/pepe',
        name: 'test',
        singleType: 'category',
        page: 1,
        params: {},
      }),
    );
    expect(connection.custom.test.url).toBe('/pepe');
    expect(connection.custom.test.params).toEqual({});
    expect(connection.custom.test.fetching).toBe(true);
    expect(connection.custom.test.ready).toBe(false);
    expect(connection.custom.test.page[0].fetching).toBe(true);
    expect(connection.custom.test.page[0].ready).toBe(false);
    expect(connection.custom.test.total.entities).toBe(null);
    expect(connection.custom.test.total.fetched.entities).toBeNull();
    expect(connection.custom.test.total.fetched.pages).toBe(1);
    expect(connection.custom.test.total.pages).toBe(null);
    expect(connection.custom.test.page[0].total).toBe(0);
  });

  test('Check CUSTOM_SUCCEED action', () => {
    const connection = Connection.create({});
    connection[actionTypes.CUSTOM_REQUESTED](
      actions.customRequested({
        url: '/pepe',
        name: 'test',
        singleType: 'category',
        page: 1,
        params: {},
      }),
    );
    connection[actionTypes.CUSTOM_SUCCEED](
      actions.customSucceed({
        url: '/pepe',
        name: 'test',
        singleType: 'category',
        page: 1,
        total: {
          entities: 7,
          pages: 1,
        },
        result: [1, 3, 4, 5, 6, 7, 8],
        entities: {
          category: snapshot.singleMap.category,
        },
      }),
    );
    expect(connection.custom.test.fetching).toBe(false);
    expect(connection.custom.test.ready).toBe(true);
    expect(connection.custom.test.page[0].fetching).toBe(false);
    expect(connection.custom.test.page[0].ready).toBe(true);
    expect(connection.custom.test.total.entities).toBe(7);
    expect(connection.custom.test.total.fetched.entities).toBe(7);
    expect(connection.custom.test.total.fetched.pages).toBe(1);
    expect(connection.custom.test.total.pages).toBe(1);
    expect(connection.custom.test.page[0].total).toBe(7);
    expect(connection.custom.test.entities[0].name).toBe('Weekend Trip');
    expect(connection.custom.test.entities[6].name).toBe('Travel');
    expect(connection.custom.test.page[0].entities[0].name).toBe('Weekend Trip');
    expect(connection.custom.test.page[0].entities[6].name).toBe('Travel');
  });

  test('Check CUSTOM_FAILED action', () => {
    const connection = Connection.create({});
    connection[actionTypes.CUSTOM_REQUESTED](
      actions.customRequested({
        url: '/pepe',
        name: 'test',
        singleType: 'category',
        page: 1,
        params: {},
      }),
    );
    connection[actionTypes.CUSTOM_FAILED](
      actions.customFailed({
        url: '/pepe',
        name: 'test',
        singleType: 'category',
        page: 1,
        error: new Error('Something went wrong!'),
        endpoint: '/pepe',
      }),
    );
    expect(connection.custom.test.fetching).toBe(false);
    expect(connection.custom.test.ready).toBe(false);
    expect(connection.custom.test.page[0].fetching).toBe(false);
    expect(connection.custom.test.page[0].ready).toBe(false);
    expect(connection.custom.test.total.entities).toBe(null);
    expect(connection.custom.test.total.fetched.entities).toBeNull();
    expect(connection.custom.test.total.fetched.pages).toBe(1);
    expect(connection.custom.test.total.pages).toBe(null);
    expect(connection.custom.test.page[0].total).toBe(0);
  });
});
