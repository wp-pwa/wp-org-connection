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

  if (type === 'latest') {
    return page > 1 ? `/page/${page}` : '/';
  }

  const id = listType ? listId : singleId;
  const single = connection.single[type][id]
  const link = single ? single.link : { url: '/', pretty: false };

  return page > 1 ? link.paged(1) : link.url;
};

const routeChanged = ({ connection, history }) =>
  eventChannel(emitter => {
    const unlisten = history.listen((location, action) => {
      const { pathname, state } = location;

      // Prevents an event emission when just replacing the URL
      if (!(isMatch(connection.selected, state.selected) && action === 'REPLACE'))
        emitter({ pathname, ...state });
    });
    return unlisten;
  });

export function* handleHistoryRouteChanges(changed) {
  yield put(actions.routeChangeSucceed(changed));
}

export const requestHandlerCreator = ({ connection, history }) =>
  function* handleRequest({ selected, method, context }) {
    const { listType, listId, singleType, singleId, page } = selected;
    if (listType) {
      if (!(connection.list[listType] && connection.list[listType][listId])) {
        yield put(actions.listRequested({ listType, listId, page }));
      }
      if (listType !== 'latest' && !connection.single[listType][listId]) {
        yield put(actions.singleRequested({ singleType: listType, singleId: listId }));
      }
    }

    if (singleType && !connection.single[singleType][singleId]) {
      yield put(actions.singleRequested({ singleType, singleId }));
    }

    const url = getUrl(selected, connection);

    // Request the next list when infinite
    if (singleType && connection.context.infinite) {
      const { columns } = connection.context;
      const nextSelected = connection.context.getItem({ singleType, singleId });
      const { column, fromList } = nextSelected;

      if (columns.indexOf(column) >= columns.length - 1 && fromList) {
        console.log('fromlist', fromList.page);
        const nextList = { listType: fromList.type, listId: fromList.id, page: fromList.page + 1 };
        yield put(actions.listRequested(nextList));
      }
    }

    if (['push', 'replace'].includes(method)) {
      yield call(history[method], url, { selected, method, context });
    }
  };

export const succeedHandlerCreator = ({ connection, history }) =>
  function* handleSucceed({ selected: { singleType, singleId, listType, listId, page } }) {
    yield call(() => {
      const type = listType || singleType;
      const id = listType ? listId : singleId;

      if (type === 'latest') return;

      // Update value if it was not pretty before
      const { link } = connection.single[type][id];
      when(
        () => link.pretty,
        () => history.replace(page > 1 ? link.paged(1) : link.url, history.location.state),
      );
    });
  };

export default function* routerSaga(stores, history = createHistory()) {
  const { connection } = stores;
  const { selected } = connection;
  const { generator } = connection.context;
  history.replace(getUrl(connection.selected, connection), {
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
  yield takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, succeedHandlerCreator({ connection, history }));
}
