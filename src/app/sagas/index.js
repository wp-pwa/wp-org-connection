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

const getList = ({ connection, wpType, params, page }) => {
  let query = connection[wpType]().page(page);
  forOwn(params, (value, key) => {
    query = query.param(key, value);
  });
  return query;
};

export function* initConnection() {
  const url = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  return new Wpapi({ endpoint: `${url}?rest_route=` });
}

export const listRequested = (connection, wpType) =>
  function* listRequestedSaga({ params: newParams, name, page }) {
    const globalParams = yield select(selectorCreators.getParams(wpType));
    const params = { ...globalParams, ...newParams };
    try {
      const response = yield call(getList, { connection, wpType, params, page });
      const normalized = normalize(response, schemas[wpType]);
      const key = toString(params);
      yield put(actions[`${wpType}ListSucceed`]({ ...normalized, params, key, name, page, wpType }));
    } catch (error) {
      yield put(
        actions[`${wpType}ListFailed`]({
          error,
          params,
          name,
          endpoint: getList({ connection, wpType, params, page }).toString(),
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
