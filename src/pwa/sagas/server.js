import { fork, spawn, join, take } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import wpApiWatchers from './wp-api-watchers';
import { requestCurrentContent, waitForCurrentContent } from './current';

export default function* wpOrgConnectionServerSaga() {
  // Wait until the INIT_SERVER_SAGAS action is dispatched. This gives other extensions time to
  // populate the store with configurations, like additional params.
  const INIT_SERVER_SAGAS = dep('build', 'types', 'INIT_SERVER_SAGAS');
  yield take(INIT_SERVER_SAGAS);
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers);
  // We create a task to wait for the succeed (or fail) of the action we will dispatch later.
  const task = yield fork(waitForCurrentContent);
  // Find out what content should we retrieve and dispatch the action.
  yield spawn(requestCurrentContent);
  // We finally wait until the action succeeds to finish the server saga.
  yield join(task);
}
