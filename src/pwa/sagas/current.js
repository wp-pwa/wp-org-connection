import { put, select, take } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';

export function* requestCurrentContent() {
  // Get current type and id from router.
  const type = yield select(dep('router', 'selectors', 'getType'));
  const id = yield select(dep('router', 'selectors', 'getId'));

  // Dispatch the proper action.
  switch (type) {
    case 'post':
      yield put(actions.postRequested({ id, current: true }));
      break;
    case 'page':
      yield put(actions.pageRequested({ id, current: true }));
      break;
    case 'media':
      yield put(actions.attachmentRequested({ id, current: true }));
      break;
    case 'category':
      yield put(actions.newPostsListRequested({ params: { categories: id } }));
      break;
    case 'tag':
      yield put(actions.newPostsListRequested({ params: { tags: id } }));
      break;
    case 'author':
      yield put(actions.newPostsListRequested({ params: { author: id } }));
      break;
    case 'search':
      yield put(actions.newPostsListRequested({ params: { search: id } }));
      break;
    default:
      yield put(actions.newPostsListRequested());
  }
}
