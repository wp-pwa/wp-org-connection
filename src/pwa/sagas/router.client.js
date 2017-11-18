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

export function* handleHistoryRouteChange(changed) {
  yield put(actions.routeChangeSucceed(changed));
}

export default ({ store, history = createHistory() }) =>
  function* routerSaga() {
    const { type, id, page } = store.router.selected;
    const context = store.router.context.id;
    const { generator } = store.router.context;
    history.replace(`/${type}/${id}/${page}/${context}`, {
      selected: {
        type,
        id,
        page,
      },
      method: 'push',
      context: generator,
    });

    // Initializate router event channels.
    const routeChangedEvents = routeChanged(history);

    // Track router events and dispatch them to redux.
    yield takeEvery(routeChangedEvents, handleHistoryRouteChange);

    // yield takeEvery(actionTypes.ROUTE_CHANGE_REQUESTED, requested => {
    //   history.push(getPathname(requested), requested);
    // });
  };
