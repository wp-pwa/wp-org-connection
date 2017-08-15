import { takeEvery, all, fork, put } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import wpApiWatchers from './wp-api-watchers';
import { requestCurrentContent } from './current';
import * as actions from '../actions';

export default function* () {
  // Deps.
  const ROUTE_CHANGE_SUCCEED = dep('router', 'types', 'ROUTE_CHANGE_SUCCEED');
  // Configure the wpapi params.
  yield put(actions.postsParamsChanged({ params: { _embed: true } }));
  // Start both the WP-API watchers and retrieve new content on each route change.
  yield all([
    fork(wpApiWatchers),
    takeEvery(ROUTE_CHANGE_SUCCEED, requestCurrentContent),
  ]);
}
