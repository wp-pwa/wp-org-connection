import { put, select, take } from 'redux-saga/effects';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as types from '../types';

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

export function* waitForCurrentContent() {
  // Get current type and id from router.
  const currentType = yield select(dep('router', 'selectors', 'getType'));
  const currentId = yield select(dep('router', 'selectors', 'getId'));

  // Wait for the proper action.
  switch (currentType) {
    case 'post':
      yield take(
        ({ type, id }) =>
          (type === types.POST_SUCCEED || type === types.POST_FAILED) && currentId === id
      );
      break;
    case 'page':
      yield take(
        ({ type, id }) =>
          (type === types.PAGE_SUCCEED || type === types.PAGE_FAILED) && currentId === id
      );
      break;
    case 'media':
      yield take(
        ({ type, id }) =>
          (type === types.ATTACHMENT_SUCCEED || type === types.ATTACHMENT_FAILED) &&
          currentId === id
      );
      break;
    // The rest of the content are lists.
    default:
      yield take(
        ({ type, name }) =>
          (type === types.NEW_POSTS_LIST_SUCCEED || type === types.NEW_POSTS_LIST_FAILED) &&
          name === 'currentList'
      );
  }
}
