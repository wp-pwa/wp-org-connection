/* eslint-disable global-require */
import { when } from 'mobx';
import { isMatch } from 'lodash';
import { takeEvery, put, call } from 'redux-saga/effects';
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

export const requestHandlerCreator = ({ store, history }) =>
  function* handleRequest({ selected, method, context }) {
    const { listType, listId, singleType, singleId, page } = selected;

    // get item
    const link = listType
      ? `/${listType}/${listId}/${page}/${context}`
      : store.connection.single[singleType][singleId].link;

    if (['push', 'replace'].includes(method)) {
      yield call(() => history[method](link, { selected, method, context }));
    }
  };

export const succeedHandlerCreator = ({ store, history }) =>
  function* handleRequest({ selected }) {
    yield call(() =>
      when(
        () =>
          isMatch(store.context.selected, selected) && store.context.selected.entity.link.pretty,
        () => {
          const { state } = history.location;
          const { link } = store.context.selected;
          history.replace(link, state);
        },
      ),
    );
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
    yield takeEvery(actionTypes.ROUTE_CHANGE_REQUESTED, requestHandlerCreator({ store, history }));
    yield takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, succeedHandlerCreator({ store, history }));
  };
