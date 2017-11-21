/* eslint-disable global-require */
import { takeEvery, select, put } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import createHistory from 'history/createBrowserHistory';
import * as actionTypes from '../actionTypes';

import * as actions from '../actions';

const routeChanged = history =>
  eventChannel(emitter => {
    const unlisten = history.listen(location => {
      const { pathname, state } = location;
      emitter({ pathname, ...state });
    });
    return unlisten;
  });

export function* handleHistoryRouteChanges(changed) {
  yield put(actions.routeChangeSucceed(changed));
}

export const requestHandler = ({ store, history }) =>
  function handleRequest({ selected, method, context }) {
    const { type, id, page } = selected;

    // get item
    const { link } =
      page !== undefined ? store.connection.single[type][id] : `/${type}/${id}/${page}/${context}`;

    console.log(link);

    if (['push', 'replace'].includes(method)) {
      history[method](link, { selected, method, context });
    }
  };

export default ({ store, history = createHistory() }) =>
  function* routerSaga() {
    const { type, id, listType, listId, singleType, singleId, page } = store.router.selected;
    const context = store.router.context.id;
    const { generator } = store.router.context;
    history.replace(`/${type}/${id}/${page}/${context}`, {
      selected: { listType, listId, page, singleType, singleId },
      method: 'push',
      context: generator,
    });

    // Initializate router event channels.
    const routeChangedEvents = routeChanged(history);

    // Track router events and dispatch them to redux.
    yield takeEvery(routeChangedEvents, handleHistoryRouteChanges);
    yield takeEvery(actionTypes.ROUTE_CHANGE_REQUESTED, requestHandler({ store, history }));
  };
