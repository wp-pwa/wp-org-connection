/* eslint-disable global-require */
import { when } from 'mobx';
import { isMatch, isEqual } from 'lodash';
import { takeEvery, put, call, all } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import createHistory from 'history/createBrowserHistory';
import { parse } from 'url';
import * as actionTypes from '../actionTypes';

import * as actions from '../actions';

// Initialize historyKeys
const historyKeys = [];
const contextKeys = [];
let currentKey = 0;

const getUrl = (selected, connection) => {
  const { listType, listId, singleType, singleId, page } = selected;
  const type = listType || singleType;
  const id = listType ? listId : singleId;

  if (type === 'latest' || !id) {
    const { pathname } = parse(connection.siteInfo.home.url);
    return page > 1 ? `${pathname}/page/${page}` : pathname;
  }

  const { link } = connection.single[type][id];

  return page > 1 ? link.paged(1) : link.url;
};

const routeChanged = ({ connection, history }) => {
  if (window) window.routerHistory = history;

  historyKeys.push(history.location.key);
  contextKeys.push(history.location.key);

  return eventChannel(emitter => {
    const unlisten = history.listen((location, action) => {
      const { pathname, state, key } = location;
      if (state.context && !isEqual(connection.selectedContext.generator, state.context)) {
        contextKeys.push(historyKeys[currentKey]);
      }

      if (action === 'PUSH') {
        currentKey += 1;
        historyKeys[currentKey] = key;
      }
      if (action === 'REPLACE') {
        historyKeys[currentKey] = key;
      }
      if (action === 'POP') {
        const newIndex = historyKeys.indexOf(key);
        if (newIndex > currentKey) state.method = 'forward';
        else state.method = 'back';
        currentKey = newIndex;
      }

      // Prevents an event emission when just replacing the URL
      if (!(isMatch(connection.selected, state.selected) && action === 'REPLACE'))
        emitter({ pathname, ...state });
    });
    return unlisten;
  });
};

export function* handleHistoryRouteChanges(changed) {
  yield put(actions.routeChangeSucceed(changed));
}

export const requestHandlerCreator = ({ connection, history }) =>
  function* handleRequest({ selectedItem, method, context }) {
    if (['push', 'replace'].includes(method)) {
      yield call(history[method], getUrl(selectedItem, connection), {
        selectedItem,
        method,
        context,
      });
    }
  };

let disposer = () => {};
const replaceHistory = ({ connection, history }) => () => {
  disposer();
  // Sets the appropriate url when available
  disposer = when(
    () =>
      getUrl(connection.selectedItem, connection) !==
      window.location.pathname + window.location.search,
    () => {
      history.replace(getUrl(connection.selectedItem, connection), history.location.state);
    },
  );
};

export default function* routerSaga(stores, history = createHistory()) {
  const { connection } = stores;
  const { selected } = connection;
  const { generator } = connection.selectedContext;

  history.replace(window.location.pathname + window.location.search, {
    selected,
    method: 'push',
    context: generator,
  });

  // Initialize router event channels.
  const routeChangedEvents = routeChanged({ connection, history });

  // Track router events and dispatch them to redux.
  yield all([
    takeEvery(routeChangedEvents, handleHistoryRouteChanges),
    takeEvery(actionTypes.ROUTE_CHANGE_REQUESTED, requestHandlerCreator({ connection, history })),
    takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, replaceHistory({ connection, history })),
  ]);
}
