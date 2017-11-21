import { expectSaga } from 'redux-saga-test-plan';
import createHistory from 'history/createMemoryHistory';
import routerSagaCreator from '../router.client';
import * as actions from '../../actions';

test('History gets replace with route from server', () => {
  const history = createHistory();
  const store = {
    router: {
      selected: {
        listId: 'post',
        listType: 'latest',
        type: 'latest',
        id: 'post',
        page: 1,
      },
      context: { id: 0 },
    },
  };
  const routerSaga = routerSagaCreator({ store, history });
  expectSaga(routerSaga).run();
  expect(history.location.pathname).toBe('/latest/post/1/0');
  expect(history.location.state).toEqual({
    method: 'push',
    selected: { listId: 'post', page: 1, listType: 'latest' },
  });
});

test('Router saga attends route change requests', () => {
  const history = createHistory();
  const store = {
    router: {
      selected: {
        listId: 'post',
        listType: 'latest',
        type: 'latest',
        id: 'post',
        page: 1,
      },
      context: { id: 0 },
    },
    connection: {
      single: {
        post: {
          60: {
            link: '/this-is-the-60th-post',
          },
        },
      },
    },
  };
  const routerSaga = routerSagaCreator({ store, history });
  expectSaga(routerSaga)
    .put(actions.routeChangeSucceed({ selected: { singleType: 'post', singleId: 60 } }))
    .dispatch(actions.routeChangeRequested({ selected: { singleType: 'post', singleId: 60 } }))
    .run();

  expect(history.location.pathname).toBe('/this-is-the-60th-post');
  expect(history.location.state).toEqual({
    selected: { singleType: 'post', singleId: 60 },
    method: 'push',
  });
});
