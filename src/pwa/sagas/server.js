import { spawn } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';

export default function* wpOrgConnectionServerSaga({ stores }) {
  // Spawn the wp api watchers. We do not fork, so this doesn't block the saga.
  yield spawn(wpApiWatchers, stores);
}
