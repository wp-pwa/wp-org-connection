import { fork, spawn, join, take, put } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import wpApiWatchers from './wp-api-watchers';
import { requestCurrentContent, waitForCurrentContent } from './current';
import * as actions from '../actions';

export default function* wpOrgConnectionServerSaga() {
  const SERVER_SAGAS_INITIALIZED = dep('build', 'types', 'SERVER_SAGAS_INITIALIZED');
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers);
  // Configure the wpapi params.
  yield put(actions.postsParamsChanged({ params: { _embed: true } }));
  // Wait until the SERVER_SAGAS_INITIALIZED action is dispatched. This gives other extensions time
  // to populate the store with configurations, like additional params.
  yield take(SERVER_SAGAS_INITIALIZED);
  // We create a task to wait for the succeed (or fail) of the action we will dispatch later.
  const task = yield fork(waitForCurrentContent);
  // Find out what content should we retrieve and dispatch the action.
  yield spawn(requestCurrentContent);
  // We finally wait until the action succeeds to finish the server saga.
  yield join(task);
}
