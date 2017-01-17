import Wpapi from 'wpapi';
import { takeLatest } from 'redux-saga';
import { forOwn } from 'lodash';
import { call, select, put } from 'redux-saga/effects';
import * as actions from '../actions';
import * as types from '../types';
import * as selectors from '../selectors';
import * as deps from '../deps';

const getPosts = ({ connection, params }) => {
  let query = connection.posts().embed();
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};
const getCategories = connection => connection.categories();

export function* initConnection() {
  const url = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  return new Wpapi({ endpoint: `${url}?rest_route=` });
}

export const refreshPosts = connection => function* refreshPostsSaga() {
  const params = yield select(selectors.getPostParams);
  try {
    const posts = yield call(getPosts, { connection, params });
    yield put(actions.refreshPostsSucceed({ posts, params }));
  } catch (error) {
    yield put(actions.refreshPostsFailed({ error, params }));
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
    takeLatest(deps.types.INITIAL_PACKAGES_ACTIVATED, function* refresh() {
      yield [ put(actions.refreshPostsRequested()), put(actions.refreshCategoriesRequested()) ];
    }),
  ];
}
