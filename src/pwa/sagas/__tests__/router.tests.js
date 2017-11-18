import { expectSaga } from 'redux-saga-test-plan';
import createHistory from 'history/createMemoryHistory';
import routerSagaCreator from '../router.client';

test('History gets replace with route from server', () => {
  const history = createHistory();
  const store = {
    router: { selected: { type: 'latest', id: null, page: 1 }, context: { id: 0 } },
  };
  const routerSaga = routerSagaCreator({ store, history });
  expectSaga(routerSaga).run();
  expect(history.location.pathname).toBe('/latest/null/1/0');
  expect(history.location.state).toEqual({
    type: 'latest',
    id: null,
    page: 1,
    context: 0,
  });
});
