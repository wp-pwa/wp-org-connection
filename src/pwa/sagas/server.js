import { fork, spawn, put, join, take } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import wpApiWatchers from './wp-api-watchers';
import { requestCurrentContent, waitForCurrentContent } from './current';

export default function* wpOrgConnectionServerSaga() {
  // Wait until the INIT_SERVER_SAGAS action is dispatched. This gives other exntesions time to
  // populate the store with configurations, like additional params.
  yield take(dep('build', 'types', 'INIT_SERVER_SAGAS'));
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers);
  // Find out what content should we retrieve.
  yield spawn(requestCurrentContent);
  // We create a task to wait for the succeed (or fail) of the action we will dispatch later.
  const task = yield fork(waitForCurrentContent);
  // We dispatch the proper action.
  yield put(actions.newPostsListRequested());
  // We finally wait until the action succeeds to finish the server saga.
  yield join(task);
}
