import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga-test-plan/matchers';
import { normalize } from 'normalizr';
import {
  singleRequested,
  getSingle,
  listRequested,
  getList,
  customRequested,
  getCustom,
} from '../wp-api-watchers';
import * as actions from '../../actions';
import * as schemas from '../../schemas';
import authorList from '../../__tests__/author-list.json';
import categoriesList from '../../__tests__/categories-list.json';
import categoriesListIncluded from '../../__tests__/categories-list-included.json';
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
describe('Sagas › Single', () => {
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
});

describe('Sagas › List', () => {
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
});

describe('Sagas › Custom', () => {
  test('Request custom list of categories', () => {
    const customRequestedSaga = customRequested(connection);
    const action = {
      url: '/',
      name: 'allCategories',
      page: 1,
      singleType: 'category',
      params: {},
    };
    const { entities, result } = normalize(categoriesList, schemas.list);
    return expectSaga(customRequestedSaga, action)
      .provide([[call.fn(getCustom), categoriesList]])
      .put(
        actions.customSucceed({
          ...action,
          entities,
          result: result.map(item => item.id),
          total: { entities: 0, pages: 0 },
        }),
      )
      .run();
  });

  test('Request custom list of included categories', () => {
    const customRequestedSaga = customRequested(connection);
    const action = {
      url: '/',
      name: 'menuCategories',
      page: 1,
      singleType: 'category',
      params: { included: [1, 3, 5] },
    };
    const { entities, result } = normalize(categoriesListIncluded, schemas.list);
    return expectSaga(customRequestedSaga, action)
      .provide([[call.fn(getCustom), categoriesListIncluded]])
      .put(
        actions.customSucceed({
          ...action,
          entities,
          result: result.map(item => item.id),
          total: { entities: 0, pages: 0 },
        }),
      )
      .run();
  });

  test('Request custom list of authors', () => {
    const customRequestedSaga = customRequested(connection);
    const action = {
      url: '/',
      name: 'allAuthors',
      page: 1,
      singleType: 'author',
      params: {},
    };
    const { entities, result } = normalize(authorList, schemas.list);
    return expectSaga(customRequestedSaga, action)
      .provide([[call.fn(getCustom), authorList]])
      .put(
        actions.customSucceed({
          ...action,
          entities,
          result: result.map(item => item.id),
          total: { entities: 0, pages: 0 },
        }),
      )
      .run();
  });
});
