import { spawn, put, all, take } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';
import headContentWatcher from './headContent';
import * as actionTypes from '../actionTypes';
import * as actions from '../actions';

function* waitForHeadContent() {
  yield take(
    ({ type }) =>
      type === actionTypes.HEAD_CONTENT_SUCCEED || type === actionTypes.HEAD_CONTENT_FAILED,
  );
}

export default function* wpOrgConnectionServerSaga({ stores, store }) {
  store.subscribe(() => {
    const action = store.getState().connection.lastAction;
    if (stores.connection[action.type]) stores.connection[action.type](action);
  });
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers, stores);
  yield spawn(headContentWatcher);
  // Request Head elements.
  yield put(actions.headContentRequested());
  // Wait until it resolves.
  yield all([waitForHeadContent()]);
}
