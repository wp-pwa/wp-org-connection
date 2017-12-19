/* eslint-disable global-require */
import { when } from 'mobx';
import { isMatch } from 'lodash';
import { takeEvery, put, call } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import createHistory from 'history/createBrowserHistory';
import * as actionTypes from '../actionTypes';

import * as actions from '../actions';

const getUrl = (selected, connection) => {
  const { listType, listId, singleType, singleId, page } = selected;
  const type = listType || singleType;
  const id = listType ? listId : singleId;

  if (type === 'latest' || !id) {
    return page > 1 ? `/page/${page}` : '/';
  }

  const { link } = connection.single[type][id];

  return page > 1 ? link.paged(1) : link.url;
};

const routeChanged = ({ connection, history }) => {
  const historyKeys = [];
  let currentKey = -1;

  return eventChannel(emitter => {
    const unlisten = history.listen((location, action) => {
      const { pathname, state, key } = location;
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
}

export function* handleHistoryRouteChanges(changed) {
  yield put(actions.routeChangeSucceed(changed));
}

export const requestHandlerCreator = ({ connection, history }) =>
  function* handleRequest({ selected, method, context }) {
    const { singleType, singleId } = selected;

    const nextSelected = connection.context.getItem({ singleType, singleId });

    // Request the next list when infinite
    if (connection.context.infinite && nextSelected) {
      const { columns } = connection.context;
      const { column, fromList } = nextSelected;

      if (columns.indexOf(column) >= columns.length - 2 && fromList) {
        const { listType, listId, page } = fromList;
        const { pages } = connection.list[listType][listId].total;

        if (page < pages && !connection.list[listType][listId].page[page]) {
          const nextList = { listType, listId, page: page + 1 };
          yield put(actions.listRequested(nextList));
        }
      }
    }

    if (['push', 'replace'].includes(method)) {
      yield call(history[method], getUrl(selected, connection), { selected, method, context });
    }
  };

let disposer = () => {};
const replaceHistory = ({ connection, history }) => () => {
  disposer();
  // Sets the appropriate url when available
  disposer = when(
    () =>
      getUrl(connection.context.selected, connection) !==
      window.location.pathname + window.location.search,
    () => {
      history.replace(getUrl(connection.context.selected, connection), history.location.state);
    },
  );
};

export default function* routerSaga(stores, history = createHistory()) {
  const { connection } = stores;
  const { selected } = connection;
  const { generator } = connection.context;
  history.replace(window.location.pathname + window.location.search, {
    selected,
    method: 'push',
    context: generator,
  });

  // Initializate router event channels.
  const routeChangedEvents = routeChanged({ connection, history });

  // Track router events and dispatch them to redux.
  yield takeEvery(routeChangedEvents, handleHistoryRouteChanges);
  yield takeEvery(
    actionTypes.ROUTE_CHANGE_REQUESTED,
    requestHandlerCreator({ connection, history }),
  );
  yield takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, replaceHistory({ connection, history }));
}
