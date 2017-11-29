import { applySnapshot, getSnapshot } from 'mobx-state-tree';
import { expectSaga } from 'redux-saga-test-plan';
import createHistory from 'history/createMemoryHistory';
import uuid from 'uuid/v4'
import Connection from '../../stores';
import routerSagaCreator from '../router.client';
import * as actions from '../../actions';

test('History gets replace with route from server', async () => {
  const history = createHistory();
  const store = {
    selected: {
      listId: 'post',
      listType: 'latest',
      type: 'latest',
      id: 'post',
      page: 1,
    },
    context: { index: 0 },
  };
  const routerSaga = routerSagaCreator({ store, history });
  await expectSaga(routerSaga).silentRun(100);
  expect(history.location.pathname).toBe('/latest/post/1/0');
  expect(history.location.state).toEqual({
    method: 'push',
    selected: { listId: 'post', page: 1, listType: 'latest' },
  });
});

test('Router saga attends route change requests', async () => {
  const history = createHistory();
  const store = {
    selected: {
      listId: 'post',
      listType: 'latest',
      type: 'latest',
      id: 'post',
      page: 1,
    },
    context: {
      index: 0,
      items: [
        {
          listId: 'post',
          listType: 'latest',
          type: 'latest',
          id: 'post',
          page: 1,
        },
      ],
    },
    single: {
      post: {
        60: {
          link: '/this-is-the-60th-post',
        },
      },
    },
  };

  const payload = { selected: { singleType: 'post', singleId: 60 } };

  await expectSaga(routerSagaCreator({ store, history }))
    .put(actions.routeChangeSucceed(payload))
    .dispatch(actions.routeChangeRequested(payload))
    .silentRun(100);

  expect(history.location.pathname).toBe('/this-is-the-60th-post');
  expect(history.location.state).toEqual({
    selected: { singleType: 'post', singleId: 60 },
    method: 'push',
    context: null,
  });
});

test('Router saga attends route change requests', async () => {
  const history = createHistory();
  const store = Connection.create();

  const itemSelected = {
    _id: uuid(),
    router: 'list',
    listId: '7',
    listType: 'categroy',
    type: 'categroy',
    id: 'post',
    page: 1,
  };

  const emptyItem = () => ({
    _id: uuid(),
    router: 'single',
    singleId: null,
    singleType: 'post',
    type: 'post',
    id: null,
    fromList: { listType: 'category', listId: 7},
  });

  const column = (item) => ({
    _id: uuid(),
    selected: item._id,
    items: [
      item,
    ],
  });

  const columns = [
    column(itemSelected),
    column(emptyItem()),
    column(emptyItem()),
    column(emptyItem()),
    column(emptyItem()),
  ]

  const firstSnapshot = {
    siteInfo: {
      perPage: 4,
    },
    selected: {
      listId: '7',
      listType: 'categroy',
      type: 'categroy',
      id: 'post',
      page: 1,
    },
    context: 0,
    contexts: [
      {
        index: 0,
        column: columns[0]._id,
        columns,
      },
    ],
    listMap: {
      category: {
        7: {
          total: {
            entities: 17,
            pages: 5,
          },
          pageMap: {
            0: {
              ready: false,
              fetching: false,
            },
            1: {
              ready: false,
              fetching: false,
            },
          },
        },
      },
    },
    singleMap: {
      post: {
        60: { type: 'post', id: 60, link: '/this-is-the-60th-post' },
      },
      category: {
        7: { type: 'category', id: 7 },
      },
    },
  };

  const secondSnapshot = Object.assign(firstSnapshot, {listMap: {
    category: {
      7: {
        pageMap: {
          0: {
            entities: [60, 61, 62, 63],
            ready: true,
            fetching: true,
          },
          1: {
            entities: [64, 65, 66],
            ready: true,
            fetching: true,
          },
        },
      },
    },
  },
    singleMap:{
      post: {
          60: { type: 'post', id: 60 },
          61: { type: 'post', id: 61 },
          62: { type: 'post', id: 62 },
          63: { type: 'post', id: 63 },
          64: { type: 'post', id: 64 },
          65: { type: 'post', id: 65 },
          66: { type: 'post', id: 66 },
      }
    }
  });

  applySnapshot(store, firstSnapshot);



  const payload = {
    selected: { singleType: 'post', singleId: 60 },
    context: {
      items: [
        { singleType: 'post', singleId: 60 },
        { listType: 'category', listId: 7, extract: true },
      ]
    }
   };

  await expectSaga(routerSagaCreator({ store, history }))
    .put(actions.routeChangeSucceed(payload))
    .dispatch(actions.routeChangeRequested(payload))
    .silentRun(100);



  expect(history.location.pathname).toBe('/this-is-the-60th-post');
  // expect(history.location.state).toEqual({
  //   selected: { singleType: 'post', singleId: 60 },
  //   method: 'push',
  //   context: null,
  // });

  store.context.columns.forEach(c => console.log(c.items[0]))
  console.log(store.context.columns.length)

  applySnapshot(store, secondSnapshot);
});
