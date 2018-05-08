/* eslint-disable no-restricted-syntax */
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import { list, entity } from '../../../schemas';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';
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

describe('Connection › Actions', () => {
  test('Entity: Action Succeed', () => {
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(false);
    connection[actionTypes.ENTITY_REQUESTED](
      actions.entityRequested({
        entity: {
          type: 'post',
          id: 60,
        },
      }),
    );
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(true);
    connection[actionTypes.ENTITY_SUCCEED](
      actions.entitySucceed({
        entity: {
          type: 'post',
          id: 60,
        },
        entities: entitiesFromPost60,
      }),
    );
    expect(connection.entity('post', 60).isReady).toBe(true);
    expect(connection.entity('post', 60).title).toBe('The Beauties of Gullfoss');
    expect(connection.entity('media', 62).title).toBe('iceland');
    expect(connection.entity('author', 4).name).toBe('Alan Martin');
  });

  test('Entity: Action Failed', () => {
    connection[actionTypes.ENTITY_REQUESTED](
      actions.entityRequested({
        entity: {
          type: 'post',
          id: 60,
        },
      }),
    );
    connection[actionTypes.ENTITY_FAILED](
      actions.entityFailed({
        entity: {
          type: 'post',
          id: 60,
        },
      }),
    );
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(false);
  });

  test('List: Action Succeed', () => {
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    connection[actionTypes.LIST_REQUESTED](
      actions.listRequested({
        list: {
          type: 'category',
          id: 7,
          page: 1,
        },
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(true);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(true);
    connection[actionTypes.LIST_SUCCEED](
      actions.listSucceed({
        list: {
          type: 'category',
          id: 7,
          page: 1,
        },
        result: resultFromCategory7,
        entities: entitiesFromCategory,
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(true);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
  });

  test('List: Action Succeed with 2 pages (reverse order)', () => {
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(false);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
    connection[actionTypes.LIST_REQUESTED](
      actions.listRequested({
        list: {
          type: 'category',
          id: 7,
          page: 2,
        },
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(true);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(false);
    expect(connection.list('category', 7).page(2).isFetching).toBe(true);
    connection[actionTypes.LIST_SUCCEED](
      actions.listSucceed({
        list: {
          type: 'category',
          id: 7,
          page: 2,
        },
        result: resultFromCategory7Page2,
        entities: entitiesFromCategoryPage2,
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(true);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
    connection[actionTypes.LIST_REQUESTED](
      actions.listRequested({
        list: {
          type: 'category',
          id: 7,
          page: 1,
        },
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(true);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(true);
    expect(connection.list('category', 7).page(2).isReady).toBe(true);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
    connection[actionTypes.LIST_SUCCEED](
      actions.listSucceed({
        list: {
          type: 'category',
          id: 7,
          page: 1,
        },
        result: resultFromCategory7,
        entities: entitiesFromCategory,
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(true);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(true);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
    expect(connection.list('category', 7).page(2).isReady).toBe(true);
    expect(connection.list('category', 7).page(2).isFetching).toBe(false);
  });

  test('List: Action Failed', () => {
    connection[actionTypes.LIST_REQUESTED](
      actions.listRequested({
        list: {
          type: 'category',
          id: 7,
          page: 1,
        },
      }),
    );
    connection[actionTypes.LIST_FAILED](
      actions.listFailed({
        list: {
          type: 'category',
          id: 7,
          page: 1,
        },
      }),
    );
    expect(connection.list('category', 7).isReady).toBe(false);
    expect(connection.list('category', 7).isFetching).toBe(false);
    expect(connection.list('category', 7).page(1).isReady).toBe(false);
    expect(connection.list('category', 7).page(1).isFetching).toBe(false);
  });

  test('List: Throw an error if page is not provided', () => {
    expect(() => {
      connection[actionTypes.LIST_REQUESTED](
        actions.listRequested({
          list: {
            type: 'category',
            id: 7,
          },
        }),
      );
    }).toThrow('The field `page` is mandatory in listRequested.');
  });

  test('Custom: Action Succeed', () => {
    expect(connection.custom('test').isReady).toBe(false);
    expect(connection.custom('test').isFetching).toBe(false);
    expect(connection.custom('test').page(1).isReady).toBe(false);
    expect(connection.custom('test').page(1).isFetching).toBe(false);
    const params = { a: 'b' };
    connection[actionTypes.CUSTOM_REQUESTED](
      actions.customRequested({
        custom: {
          name: 'test',
          page: 1,
        },
        params,
        url: '/#test',
      }),
    );
    expect(connection.custom('test').isReady).toBe(false);
    expect(connection.custom('test').isFetching).toBe(true);
    expect(connection.custom('test').params).toEqual(params);
    expect(connection.custom('test').url).toBe('/#test');
    expect(connection.custom('test').page(1).isReady).toBe(false);
    expect(connection.custom('test').page(1).isFetching).toBe(true);
    connection[actionTypes.CUSTOM_SUCCEED](
      actions.customSucceed({
        custom: {
          name: 'test',
        },
        result: resultFromCategory7,
        entities: entitiesFromCategory,
      }),
    );
    expect(connection.custom('test').isReady).toBe(true);
    expect(connection.custom('test').isFetching).toBe(false);
    expect(connection.custom('test').page(1).isReady).toBe(true);
    expect(connection.custom('test').page(1).isFetching).toBe(false);
  });

  test('Custom: Action Failed', () => {
    connection[actionTypes.CUSTOM_REQUESTED](
      actions.customRequested({
        custom: {
          name: 'test',
          page: 1,
        },
        params: {},
      }),
    );
    connection[actionTypes.CUSTOM_FAILED](actions.customFailed({ custom: { name: 'test' } }));
    expect(connection.custom('test').isReady).toBe(false);
    expect(connection.custom('test').isFetching).toBe(false);
    expect(connection.custom('test').page(1).isReady).toBe(false);
    expect(connection.custom('test').page(1).isFetching).toBe(false);
  });

  test('Custom: Throw an error if page is not provided', () => {
    expect(() => {
      connection[actionTypes.CUSTOM_REQUESTED](
        actions.customRequested({
          custom: {
            name: 'test',
          },
          params: {},
        }),
      );
    }).toThrow('The field `page` is mandatory in customRequested.');
  });
});
