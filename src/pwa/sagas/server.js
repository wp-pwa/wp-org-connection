import { spawn, put, all } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';
import * as actions from '../actions';
import { waitForSiteInfo, waitForHeadElements } from './waiters';

export default function* wpOrgConnectionServerSaga({ stores }) {
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers, stores);
  // Request Site Info.
  yield put(actions.siteInfoRequested());
  // Request Head elements.
  yield put(actions.headElementsRequested());
  // Wait until it resolves.
  yield all([waitForSiteInfo(), waitForHeadElements()]);
}
