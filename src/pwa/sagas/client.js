import { all, fork } from 'redux-saga/effects';
import wpApiWatchers from './wp-api-watchers';
import progress from './progress';

export default function* ({ stores, store }) {
  store.subscribe(() => {
    const action = store.getState().connection.lastAction;
    if (stores.connection[action.type]) stores.connection[action.type](action);
  });
  // Start both the WP-API watchers and retrieve new content on each route change.
  yield all([
    fork(wpApiWatchers, stores),
    fork(progress),
  ]);
}
