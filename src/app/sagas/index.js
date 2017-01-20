import Wpapi from 'wpapi';
import { takeLatest } from 'redux-saga';
import { normalize } from 'normalizr';
import { forOwn } from 'lodash';
import { toString } from 'query-parse';
import { call, select, put } from 'redux-saga/effects';
import * as actions from '../actions';
import * as types from '../types';
import * as selectorCreators from '../selectorCreators';
import * as schemas from '../schemas';
import * as deps from '../deps';

const getList = ({ connection, type, params, page }) => {
  let query = connection[type]().page(page);
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};

export function* initConnection() {
  const url = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  return new Wpapi({ endpoint: `${url}?rest_route=` });
}

export const listRequested = (connection, type) =>
  function* listRequestedSaga({ params: newParams, current, page }) {
    const globalParams = yield select(selectorCreators.getParams(type));
    const params = { ...globalParams, ...newParams };
    try {
      const response = yield call(getList, { connection, type, params, page });
      const normalized = normalize(response, schemas[type]);
      const key = toString(params);
      yield put(actions[`${type}ListSucceed`]({ ...normalized, params, key, current, page }));
    } catch (error) {
      yield put(
        actions[`${type}ListFailed`]({
          error,
          params,
          endpoint: getList({ connection, type, params, page }).toString(),
        }),
      );
    }
  };

export default function* wpOrgConnectionSagas() {
  const connection = yield call(initConnection);
  yield [
    put(actions.postsParamsChanged({ params: { _embed: true } })),
    takeLatest(types.POSTS_LIST_REQUESTED, listRequested(connection, 'posts')),
    takeLatest(types.PAGES_LIST_REQUESTED, listRequested(connection, 'pages')),
    takeLatest(types.TAGS_LIST_REQUESTED, listRequested(connection, 'tags')),
    takeLatest(types.USERS_LIST_REQUESTED, listRequested(connection, 'users')),
    takeLatest(types.MEDIA_LIST_REQUESTED, listRequested(connection, 'media')),
    takeLatest(types.CATEGORIES_LIST_REQUESTED, listRequested(connection, 'categories')),
    takeLatest(types.COMMENTS_LIST_REQUESTED, listRequested(connection, 'comments')),
    takeLatest(types.TAXONOMIES_LIST_REQUESTED, listRequested(connection, 'taxonomies')),
    takeLatest(types.POST_TYPES_LIST_REQUESTED, listRequested(connection, 'types')),
    takeLatest(types.POST_STATUSES_LIST_REQUESTED, listRequested(connection, 'statuses')),
  ];
}
