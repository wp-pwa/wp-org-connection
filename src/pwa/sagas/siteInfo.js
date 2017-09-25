import { put, take } from 'redux-saga/effects';
// import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as types from '../types';

export function* requestSiteInfo() {
  yield put(actions.siteInfoRequested());
}

export function* waitForSiteInfo() {
  yield take(({ type }) => type === types.SITE_INFO_SUCCEED || type === types.SITE_INFO_FAILED);
}
