import { take } from 'redux-saga/effects';
import * as actionTypes from '../actionTypes';

export function* waitForSiteInfo() {
  yield take(
    ({ type }) => type === actionTypes.SITE_INFO_SUCCEED || type === actionTypes.SITE_INFO_FAILED,
  );
}

export function* waitForHeadContent() {
  yield take(
    ({ type }) =>
      type === actionTypes.HEAD_CONTENT_SUCCEED || type === actionTypes.HEAD_CONTENT_FAILED,
  );
}
