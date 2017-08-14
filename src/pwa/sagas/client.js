import { takeEvery, all, fork } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import wpApiWatchers from './wp-api-watchers';
import { requestCurrentContent } from './current';

export default function* () {
  const ROUTE_CHANGE_SUCCEED = dep('router', 'types', 'ROUTE_CHANGE_SUCCEED');
  yield all([
    fork(wpApiWatchers),
    takeEvery(ROUTE_CHANGE_SUCCEED, requestCurrentContent),
  ]);
}
