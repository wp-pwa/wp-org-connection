import { spawn, put, all, take } from 'redux-saga/effects';
import { CONNECTION_INITIALIZED } from '../actionTypes';
import wpApiWatchers from './wp-api-watchers';
import headContentWatcher from './headContent';
import * as actions from '../actions';
import { waitForSiteInfo, waitForHeadContent } from './waiters';

export default function* wpOrgConnectionServerSaga({ stores }) {
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers, stores);
  yield spawn(headContentWatcher);
  // Wait until connection is initialized.
  yield take(CONNECTION_INITIALIZED);
  // Request Site Info.
  yield put(actions.siteInfoRequested());
  // Request Head elements.
  yield put(actions.headContentRequested());
  // Wait until it resolves.
  yield all([waitForSiteInfo(), waitForHeadContent()]);
}
