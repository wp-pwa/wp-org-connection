import { all, fork } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';
import progress from './progress';
import routerSaga from './router.client';

export default function* ({ stores }) {
  // Start both the WP-API watchers and retrieve new content on each route change.
  yield all([
    fork(routerSaga, stores),
    fork(wpApiWatchers, stores),
    fork(progress),
  ]);
}
