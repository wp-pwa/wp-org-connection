/* eslint-disable camelcase */
import { takeLatest } from 'redux-saga';
import { put, select, take } from 'redux-saga/effects';
import * as actions from '../actions';
import * as deps from '../deps';

export function* router() {
  const query = yield select(deps.selectors.getURLQueries);
  const { p, cat, tag, author, y, m, page_id, s, attachment_id } = query;
  if (p) yield put(actions.postRequested({ id: p }));
  else if (cat) yield put(actions.newPostsListRequested({ params: { categories: cat } }));
  else if (tag) yield put(actions.newPostsListRequested({ params: { tags: tag } }));
  else if (author) yield put(actions.newPostsListRequested({ params: { author } }));
    // else if (y || m) yield put(actions.archiveRequested({ params: {  } }));
  else if (page_id) yield put(actions.pageRequested({ id: page_id }));
  else if (s) yield put(actions.newPostsListRequested({ params: { search: s } }));
  else if (attachment_id) yield put(actions.attachmentRequested({ id: attachment_id }));
  else yield put(actions.newPostsListRequested());
}

export default function* defaultsSaga() {
  yield [
    take(deps.types.INITIAL_PACKAGES_ACTIVATED, router),
    takeLatest(deps.types.ROUTER_DID_CHANGE, router),
  ];
}
