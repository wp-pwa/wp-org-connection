import { put, take } from 'redux-saga/effects';
// import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';

export function* requestSiteInfo() {
  yield put(actions.siteInfoRequested());
}

export function* waitForSiteInfo() {
  yield take(
    ({ type }) => type === actionTypes.SITE_INFO_SUCCEED || type === actionTypes.SITE_INFO_FAILED,
  );
}
