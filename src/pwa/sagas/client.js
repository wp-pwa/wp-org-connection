import { all, fork } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';
import progress from './progress';

export default function* () {
  // Start both the WP-API watchers and retrieve new content on each route change.
  yield all([
    fork(wpApiWatchers),
    fork(progress),
  ]);
}
