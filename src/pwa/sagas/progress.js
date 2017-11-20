import { take, all, fork, takeEvery } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import NProgress from 'nprogress';

function* initProgress() {
  yield take(dep('build', 'actionTypes', 'CLIENT_RENDERED'));
  NProgress.configure({ showSpinner: false });
}

function stopProgress() {
  setTimeout(() => {
    NProgress.done();
  }, 300);
}

export default function* progressSagas() {
  yield all([
    fork(initProgress),
    takeEvery(dep('router', 'actionTypes', 'ROUTE_CHANGE_SUCCEED'), stopProgress),
  ]);
}
