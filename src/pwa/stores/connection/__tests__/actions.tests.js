/* eslint-disable no-restricted-syntax */
import { autorun } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import { list, entity } from '../../../schemas';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';
import convert from '../../../converters';
import post60 from '../../../__tests__/post-60.json';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
import postsFromCategory7Page2 from '../../../__tests__/posts-from-category-7-page-2.json';

const { result: resultFromCategory7, entities: entitiesFromCategory } = normalize(
  postsFromCategory7,
  list,
);
const { result: resultFromCategory7Page2, entities: entitiesFromCategoryPage2 } = normalize(
  postsFromCategory7Page2,
  list,
);
const { entities: entitiesFromPost60 } = normalize(post60, entity);

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

let connection = null;
beforeEach(() => {
  connection = Connection.create({});
  unprotect(connection);
});

describe('Store › Actions', () => {
  test('Single: Action Succeed', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('post', 60).fetching).toBe(false);
    connection[actionTypes.SINGLE_REQUESTED](actions.singleRequested({
      singleType: 'post',
      singleId: 60,
    }));
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('post', 60).fetching).toBe(true);
    connection[actionTypes.SINGLE_SUCCEED](actions.singleSucceed({
      singleType: 'post',
      singleId: 60,
      entities: entitiesFromPost60,
    }));
    expect(connection.entity('post', 60).ready).toBe(true);
    expect(connection.entity('post', 60).title).toBe('The Beauties of Gullfoss');
    expect(connection.entity('media', 62).title).toBe('iceland');
    expect(connection.entity('author', 4).name).toBe('Alan Martin');
  });

  test('Single: Action Failed', () => {
    connection[actionTypes.SINGLE_REQUESTED](actions.singleRequested({
      singleType: 'post',
      singleId: 60,
    }));
    connection[actionTypes.SINGLE_FAILED](actions.singleSucceed({
      singleType: 'post',
      singleId: 60,
    }));
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('post', 60).fetching).toBe(false);
  });

  test('List: Action Succeed', () => {
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    connection[actionTypes.LIST_REQUESTED](actions.listRequested({
      listType: 'category',
      listId: 7,
    }));
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).fetching).toBe(true);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(true);
    connection[actionTypes.LIST_SUCCEED](actions.listSucceed({
      listType: 'category',
      listId: 7,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    }));
    expect(connection.list('category', 7).ready).toBe(true);
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(true);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
  });

  test('List: Action Succeed with 2 pages (reverse order)', () => {
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    expect(connection.list('category', 7).page(2).ready).toBe(false);
    expect(connection.list('category', 7).page(2).fetching).toBe(false);
    connection[actionTypes.LIST_REQUESTED](actions.listRequested({
      listType: 'category',
      listId: 7,
      page: 2,
    }));
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).fetching).toBe(true);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    expect(connection.list('category', 7).page(2).ready).toBe(false);
    expect(connection.list('category', 7).page(2).fetching).toBe(true);
    connection[actionTypes.LIST_SUCCEED](actions.listSucceed({
      listType: 'category',
      listId: 7,
      page: 2,
      result: resultFromCategory7Page2,
      entities: entitiesFromCategoryPage2,
    }));
    expect(connection.list('category', 7).ready).toBe(true);
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    expect(connection.list('category', 7).page(2).ready).toBe(true);
    expect(connection.list('category', 7).page(2).fetching).toBe(false);
    connection[actionTypes.LIST_REQUESTED](actions.listRequested({
      listType: 'category',
      listId: 7,
      page: 1,
    }));
    expect(connection.list('category', 7).ready).toBe(true);
    expect(connection.list('category', 7).fetching).toBe(true);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(true);
    expect(connection.list('category', 7).page(2).ready).toBe(true);
    expect(connection.list('category', 7).page(2).fetching).toBe(false);
    connection[actionTypes.LIST_SUCCEED](actions.listSucceed({
      listType: 'category',
      listId: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    }));
    expect(connection.list('category', 7).ready).toBe(true);
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(true);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    expect(connection.list('category', 7).page(2).ready).toBe(true);
    expect(connection.list('category', 7).page(2).fetching).toBe(false);
  });

  test('List: Action Failed', () => {
    connection[actionTypes.LIST_REQUESTED](actions.listRequested({
      listType: 'category',
      listId: 7,
    }));
    connection[actionTypes.LIST_FAILED](actions.listSucceed({
      listType: 'category',
      listId: 7,
    }));
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
  });
});
