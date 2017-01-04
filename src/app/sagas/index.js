import Wpapi from 'wpapi';
import { takeLatest } from 'redux-saga';
import { call, select, put } from 'redux-saga/effects';
import * as actions from '../actions';
import * as types from '../types';
import * as deps from '../deps';

export function* initConnection() {
  const url = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  return new Wpapi({ endpoint: `${url}?rest_route=` });
}

export const refreshPosts = connection => function* refreshPostsSaga() {
  try {
    const posts = yield call([connection, connection.posts]);
    yield put(actions.refreshPostsSucceed({ posts }));
  } catch (error) {
    yield put(actions.refreshPostsFailed({ error }));
  }
};

export default function* wpOrgConnectionSagas() {
  const connection = yield call(initConnection);
  yield [
    takeLatest(types.REFRESH_POSTS_REQUESTED, refreshPosts(connection)),
    put(actions.refreshPostsRequested()),
  ];
}
