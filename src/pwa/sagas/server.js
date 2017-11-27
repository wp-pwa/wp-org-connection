import { spawn, put, take } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';

export default function* wpOrgConnectionServerSaga({ stores }) {
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers, stores);
  // Request Site Info.
  yield put(actions.siteInfoRequested());
  // Wait until it resolves.
  yield take(
    ({ type }) => type === actionTypes.SITE_INFO_SUCCEED || type === actionTypes.SITE_INFO_FAILED,
  );
}
