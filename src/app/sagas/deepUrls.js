/* eslint-disable no-param-reassign, camelcase */
import { takeLatest } from 'redux-saga';
import { select, put, call } from 'redux-saga/effects';
import * as actions from '../actions';
import * as types from '../types';
import * as deps from '../deps';

const getDiscover = ({ connection, firstFolder, lastFolder }) => {
  const query = connection.discover().param('last_folder', lastFolder);
  if (firstFolder) query.param('first_folder', firstFolder);
  return query;
};

export const discoverUrl = connection =>
  function* discoverUrlSaga({ firstFolder, lastFolder }) {
    try {
      const { post_type, ID, taxonomy, term_id } = yield call(getDiscover, {
        connection,
        firstFolder,
        lastFolder,
      });
      if (post_type) yield put(actions.discoverUrlSucceed({ postType: post_type, id: ID }));
      else if (taxonomy) yield put(actions.discoverUrlSucceed({ taxonomy, id: term_id }));
      else throw new Error('Nothing found.');
    } catch (error) {
      yield put(
        actions.discoverUrlFailed({
          error,
          firstFolder,
          lastFolder,
          endpoint: getDiscover({ connection, firstFolder, lastFolder }).toString(),
        })
      );
    }
  };

export function* redirectAfterDiscover({ postType, taxonomy, id }) {
  let key = '';
  if (postType)
    if (postType === 'post') key = '?p=';
    else if (postType === 'page') key = '?page_id=';
    else key = `?${postType}= `;
  else if (taxonomy)
    if (taxonomy === 'category') key = '?cat=';
    else if (taxonomy === 'post_tag') key = '?tag=';
    else key = `?${taxonomy}=`;
  yield call(deps.libs.push, `${key}${id}`);
}

export function* deepUrl({ url }) {
  const siteUrl = yield select(deps.selectorCreators.getSetting('generalSite', 'url'));
  const path = url.replace(/https?:\/\//, '').replace(siteUrl.replace(/https?:\/\//, ''), '');
  if (path === '' || path === '/') {
    yield call(deps.libs.push, '?');
  } else {
    const regexp = /^\/?([^/]+)(?:.*?)?([^/]+)?\/?$/.exec(path);
    const firstFolder = regexp[2] ? regexp[1] : null;
    const lastFolder = regexp[2] || regexp[1];
    yield put(actions.discoverUrlRequested({ firstFolder, lastFolder }));
  }
}

export default function* deepUrlsSaga(connection) {
  connection.discover = connection.registerRoute('worona/v1', 'discover', {
    params: ['first_folder', 'last_folder'],
  });
  yield takeLatest(types.DISCOVER_URL_SUCCEED, redirectAfterDiscover);
  yield takeLatest(types.DISCOVER_URL_REQUESTED, discoverUrl(connection));
  yield takeLatest(deps.types.DEEP_URL_VISITED, deepUrl);
}
