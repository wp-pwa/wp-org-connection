import { take } from 'redux-saga/effects';
import * as actionTypes from '../actionTypes';

export function* waitForSiteInfo() {
  yield take(
    ({ type }) => type === actionTypes.SITE_INFO_SUCCEED || type === actionTypes.SITE_INFO_FAILED
  );
}

export function* waitForHeadElements() {
  yield take(
    ({ type }) =>
      type === actionTypes.HEAD_ELEMENTS_SUCCEED || type === actionTypes.HEAD_ELEMENTS_FAILED
  );
}
