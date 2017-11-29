import { expectSaga } from 'redux-saga-test-plan';
import createHistory from 'history/createMemoryHistory';
import routerSagaCreator from '../router.client';
import * as actions from '../../actions';

test('History gets replace with route from server', async () => {
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
