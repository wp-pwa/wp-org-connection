import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga-test-plan/matchers';
import { singleRequested, getSingle, listRequested, getList } from '../wp-api-watchers';
import * as actions from '../../actions';
import post60 from '../../__tests__/post-60.json';
import post60normalized from '../../__tests__/post-60-normalized.json';
import category7 from '../../__tests__/category-7.json';
import category7normalized from '../../__tests__/category-7-normalized.json';
import tag10 from '../../__tests__/tag-10.json';
import tag10normalized from '../../__tests__/tag-10-normalized.json';
import postsFromLatest from '../../__tests__/posts-from-latest.json';
import postsFromLatestNormalized from '../../__tests__/posts-from-latest-normalized.json';
import postsFromCategory7 from '../../__tests__/posts-from-category-7.json';
import postsFromCategory7Normalized from '../../__tests__/posts-from-category-7-normalized.json';

const connection = {};

test('Request single post', () => {
  const singleRequestedSaga = singleRequested(connection);
  const action = { singleType: 'post', singleId: 60 };
  return expectSaga(singleRequestedSaga, action)
    .provide([[call.fn(getSingle), post60]])
    .put(actions.singleSucceed({ entities: post60normalized, ...action }))
    .run();
});

test('Request single category', () => {
  const singleRequestedSaga = singleRequested(connection);
  const action = { singleType: 'category', singleId: 7 };
  return expectSaga(singleRequestedSaga, action)
    .provide([[call.fn(getSingle), category7]])
    .put(actions.singleSucceed({ entities: category7normalized, ...action }))
    .run();
});

test('Request single tag', () => {
  const singleRequestedSaga = singleRequested(connection);
  const action = { singleType: 'tag', singleId: 10 };
  return expectSaga(singleRequestedSaga, action)
    .provide([[call.fn(getSingle), tag10]])
    .put(actions.singleSucceed({ entities: tag10normalized, ...action }))
    .run();
});

test('Request latest list of posts', () => {
  const listRequestedSaga = listRequested(connection);
  const action = { listType: 'latest' };
  return expectSaga(listRequestedSaga, action)
    .provide([[call.fn(getList), postsFromLatest]])
    .put(
      actions.listSucceed({
        entities: postsFromLatestNormalized,
        ...action,
        result: [60, 57, 54, 51, 46, 42, 36, 33, 30, 26],
      }),
    )
    .run();
});

test('Request latest list of posts (second page)', () => {
  const listRequestedSaga = listRequested(connection);
  const action = { listType: 'latest', page: 2 };
  return expectSaga(listRequestedSaga, action)
    .provide([[call.fn(getList), postsFromLatest]])
    .put(
      actions.listSucceed({
        entities: postsFromLatestNormalized,
        ...action,
        result: [60, 57, 54, 51, 46, 42, 36, 33, 30, 26],
      }),
    )
    .run();
});

test('Request list of posts from category', () => {
  const listRequestedSaga = listRequested(connection);
  const action = { listType: 'category', listId: 7 };
  return expectSaga(listRequestedSaga, action)
    .provide([[call.fn(getList), postsFromCategory7]])
    .put(
      actions.listSucceed({
        entities: postsFromCategory7Normalized,
        ...action,
        result: [57, 54, 42, 36, 33, 30, 26, 23, 12, 1],
      }),
    )
    .run();
});
