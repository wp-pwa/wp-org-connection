import Wpapi from 'wpapi';
import { takeLatest } from 'redux-saga';
import { call, select, put } from 'redux-saga/effects';
import * as actions from '../actions';
import * as types from '../types';
import * as deps from '../deps';

const getPosts = connection => new Promise((resolve, reject) =>
  connection.posts().embed()
    .then(result => resolve(result))
    .catch(error => reject(error)));
const getCategories = connection => connection.categories();

export function* initConnection() {
  const url = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  return new Wpapi({ endpoint: `${url}?rest_route=` });
}

export const refreshPosts = connection => function* refreshPostsSaga() {
  try {
    const posts = yield call(getPosts, connection);
    yield put(actions.refreshPostsSucceed({ posts }));
  } catch (error) {
    yield put(actions.refreshPostsFailed({ error }));
  }
};

export const refreshCategories = connection => function* refreshCategoriesSaga() {
  try {
    const categories = yield call(getCategories, connection);
    yield put(actions.refreshCategoriesSucceed({ categories }));
  } catch (error) {
    yield put(actions.refreshCategoriesFailed({ error }));
  }
};

export default function* wpOrgConnectionSagas() {
  const connection = yield call(initConnection);
  yield [
    takeLatest(types.REFRESH_POSTS_REQUESTED, refreshPosts(connection)),
    takeLatest(types.REFRESH_CATEGORIES_REQUESTED, refreshCategories(connection)),
    put(actions.refreshPostsRequested()),
    put(actions.refreshCategoriesRequested()),
  ];
}
