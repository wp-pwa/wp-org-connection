import { autorun } from 'mobx';
import { getSnapshot } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import { entity, list } from '../../../schemas';
import Connection from '../../';
import * as actionTypes from '../../../actionTypes';
import * as actions from '../../../actions';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
import post60 from '../../../__tests__/post-60.json';

jest.mock('uuid/v4', () => {
  let id = 0;
  return jest.fn(() => {
    id += 1;
    return `mockedId_${id}`;
  });
});

const { result: resultFromCategory7, entities: entitiesFromCategory } = normalize(
  postsFromCategory7,
  list,
);

const { entities: entitiesFromPost60 } = normalize(post60, entity);

let connection;
beforeEach(() => {
  connection = Connection.create({});
});

describe('Connection › Router', () => {
  test('Initializes contexts as empty array', () => {
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedContext).toBe(null);
  });

  test('Selected single', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
    expect(connection.selectedItem.page).toBe(undefined);
    expect(connection.selectedItem.isSingle).toBe(true);
    expect(connection.selectedItem.isList).toBe(false);
  });

  test('Selected list', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'category', id: 7, page: 2 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
    expect(connection.selectedItem.page).toBe(2);
    expect(connection.selectedItem.isSingle).toBe(false);
    expect(connection.selectedItem.isList).toBe(true);
  });

  test('Selected single with previous different context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 63 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[1].index);
    expect(getSnapshot(connection.selectedContext).generator).toEqual({
      columns: [[{ type: 'post', id: 60, page: undefined }]],
    });
    expect(connection.selectedItem.id).toBe(60);
  });

  test('Selected list with previous different context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'category', id: 7, page: 1 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[1].index);
    expect(connection.selectedItem.id).toBe(7);
  });

  test('Selected single and new context with selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }, { type: 'post', id: 60 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[1]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[1].items[1]);
  });

  test('Selected single and new context without selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }, { type: 'post', id: 64 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts[0].columns[0].items[0].id).toBe(60);
    expect(connection.selectedItem.id).toBe(60);
  });

  test('Selected list and new context with selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 1 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'latest', id: 'post', page: 1 }],
            [{ type: 'category', id: 7, page: 1 }],
            [{ type: 'tag', id: 10, page: 1 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[1]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[1].items[0]);
  });

  test('Selected list and new context without selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 1 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'latest', id: 'post', page: 1 }],
            [{ type: 'category', id: 3, page: 1 }],
            [{ type: 'tag', id: 10, page: 1 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts[0].columns[0].items[0].id).toBe(7);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem.id).toBe(7);
  });

  test('Selected single with previous equal context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[0]);
  });

  test('Selected single and new context, with previous diff context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }, { type: 'post', id: 60 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedColumn).toBe(connection.contexts[1].columns[1]);
    expect(connection.selectedItem).toBe(connection.contexts[1].columns[1].items[1]);
  });

  test('Selected single and previous context with selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }, { type: 'post', id: 60 }],
          ],
        },
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 63 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(1);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[0]);
  });

  test('First selected item should be visited', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'category', id: 7, page: 1 } }),
    );
    expect(connection.selectedItem.visited).toBe(true);
  });

  test('Current selected item and previous ones should be visited', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }, { type: 'post', id: 60 }],
          ],
        },
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 63 } }),
    );
    expect(connection.selectedContext.getItem({ item: { type: 'post', id: 60 } }).visited).toBe(
      true,
    );
    expect(connection.selectedContext.getItem({ item: { type: 'post', id: 63 } }).visited).toBe(
      true,
    );
    expect(connection.selectedContext.getItem({ item: { type: 'post', id: 62 } }).visited).toBe(
      false,
    );
  });

  test('Move selected single', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 63 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }, { type: 'post', id: 60 }],
          ],
        },
      }),
    );
    connection[actionTypes.MOVE_ITEM_TO_COLUMN](
      actions.moveItemToColumn({ item: { type: 'post', id: 62 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(1);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[0]);
    expect(connection.selectedItem.id).toBe(63);
    expect(connection.selectedItem.nextItem.id).toBe(62);
    expect(connection.contexts[0].columns[1].items[0].id).toBe(60);
  });

  test('Move selected single from column with only that item', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 62 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }],
            [{ type: 'post', id: 60 }],
          ],
        },
      }),
    );
    connection[actionTypes.MOVE_ITEM_TO_COLUMN](
      actions.moveItemToColumn({ item: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts[0].columns.length).toBe(2);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[1]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[1].items[0]);
    expect(connection.selectedItem.nextItem.id).toBe(60);
  });

  test('Move selected single with previous context without selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 62 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }],
            [{ type: 'post', id: 61 }],
          ],
        },
      }),
    );
    expect(() =>
      connection[actionTypes.MOVE_ITEM_TO_COLUMN](
        actions.moveItemToColumn({ item: { type: 'post', id: 60 } }),
      ),
    ).toThrow("Can't move if selected doesn't exist in the previous context.");
  });

  test('Replace context with new one', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 63 },
        context: {
          columns: [
            [{ type: 'post', id: 63 }],
            [{ type: 'post', id: 62 }],
            [{ type: 'post', id: 61 }],
          ],
        },
      }),
    );
    connection[actionTypes.REPLACE_CONTEXT](
      actions.replaceContext({
        context: {
          columns: [
            [{ type: 'post', id: 63 }, { type: 'latest', id: 'post', page: 1 }],
            [{ type: 'category', id: 7, page: 1 }],
            [{ type: 'tag', id: 3, page: 1 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(1);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[0]);
    expect(connection.selectedItem.type).toBe('post');
    expect(connection.contexts[0].columns[0].items[0].type).toBe('post');
    expect(connection.contexts[0].columns[0].items[1].type).toBe('latest');
    expect(connection.contexts[0].columns[1].items[0].type).toBe('category');
    expect(connection.contexts[0].columns[2].items[0].type).toBe('tag');
  });

  test('Subscribe to selectedItem when context is replaced', done => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: { columns: [[{ type: 'post', id: 60 }]] },
      }),
    );
    autorun(() => {
      if (connection.selectedItem.ready) done();
    });
    connection[actionTypes.REPLACE_CONTEXT](
      actions.replaceContext({ context: { columns: [[{ type: 'post', id: 60 }]] } }),
    );
    connection[actionTypes.SINGLE_SUCCEED](
      actions.singleSucceed({
        singleType: 'post',
        singleId: 60,
        entities: entitiesFromPost60,
      }),
    );
  });

  test('Select in previous context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 1 },
        context: {
          columns: [[{ type: 'category', id: 7, page: 1 }, { type: 'category', id: 7, page: 2 }]],
        },
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 62 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 2 },
        method: 'backward',
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(2);
    expect(connection.selectedContext.index).toBe(0);
    expect(connection.selectedContext.columns[0].items[1].id).toBe(connection.selectedItem.id);
    expect(connection.selectedItem.id).toBe(7);
  });

  test('Try to select in previous context where item doesnt exist', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 1 },
        context: {
          columns: [[{ type: 'category', id: 7, page: 1 }, { type: 'category', id: 7, page: 2 }]],
        },
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 62 } }),
    );
    expect(() =>
      connection[actionTypes.ROUTE_CHANGE_SUCCEED](
        actions.routeChangeSucceed({
          selectedItem: { type: 'category', id: 7, page: 3 },
          method: 'backward',
        }),
      ),
    ).toThrow("You are trying to select an item in a context where doesn't exist");
  });

  test('Select in next context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 1 },
        context: {
          columns: [[{ type: 'category', id: 7, page: 1 }, { type: 'category', id: 7, page: 2 }]],
        },
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 62 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 2 },
        method: 'backward',
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 62 },
        method: 'forward',
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(2);
    expect(connection.selectedContext.index).toBe(1);
    expect(connection.selectedItem.id).toBe(62);
  });

  test('Try to select in next context where item doesnt exist', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 1 },
        context: {
          columns: [[{ type: 'category', id: 7, page: 1 }, { type: 'category', id: 7, page: 2 }]],
        },
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 62 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 2 },
        method: 'backward',
      }),
    );
    expect(() =>
      connection[actionTypes.ROUTE_CHANGE_SUCCEED](
        actions.routeChangeSucceed({
          selectedItem: { type: 'post', id: 63 },
          method: 'forward',
        }),
      ),
    ).toThrow("You are trying to select an item in a context where doesn't exist");
  });

  test('Selected single and context object with extracted', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: { columns: [[{ type: 'latest', id: 'post', page: 1, extract: true }]] },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedContext.columns.length).toBe(1);
  });

  test('Columns should not show next items if extracted after that item is not resolved', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          columns: [
            [{ type: 'post', id: 60 }],
            [{ type: 'latest', id: 'post', page: 1, extract: true }],
            [{ type: 'post', id: 63 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedContext.columns.length).toBe(1);
  });

  test('Columns should not show previous items if extracted before that item is not resolved', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 63 },
        context: {
          columns: [
            [{ type: 'post', id: 60 }],
            [{ type: 'latest', id: 'post', page: 1, extract: true }],
            [{ type: 'post', id: 63 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedContext.columns.length).toBe(1);
  });

  test('Add items to extracted once they are ready', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: { columns: [[{ type: 'category', id: 7, page: 1, extract: true }]] },
      }),
    );
    connection[actionTypes.LIST_SUCCEED](
      actions.listSucceed({
        listType: 'category',
        listId: 7,
        result: resultFromCategory7,
        entities: entitiesFromCategory,
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedContext.columns.length).toBe(11);
  });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // actions.routeChangeSucceed({
  //   selectedItem: { type: 'post', id: 60 },
  //   context: {
  //     options: { header: 'post' },
  //     columns: [
  //       {
  //         items: [{ type: 'post', id: 62 }],
  //         infiniteScroll: 'nextNonVisited',
  //       },
  //       {
  //         items: [{ type: 'post', id: 63 }, { type: 'post', id: 60 }],
  //         infiniteScroll: 'nextNonVisited',
  //       },
  //       {
  //         items: [{ type: 'category', id: 7, page: 1 }],
  //         infiniteScroll: { type: 'category', id: 7, fromPage: 2 },
  //       },
  //     ],
  //     infiniteSwipe: {
  //       type: 'category',
  //       id: 7,
  //       extract: true,
  //       fromPage: 2,
  //       infiniteScroll: 'nextNonVisited',
  //     },
  //   },
  // });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // actions.routeChangeSucceed({
  //   selectedItem: { type: 'post', id: 60 },
  //   context: {
  //     options: { header: 'list' },
  //     columns: [
  //       {
  //         items: [{ type: 'category', id: 7, page: 1, extract: true }],
  //         infiniteScroll: 'moveNextNonVisited',
  //       },
  //     ],
  //     infiniteSwipe: {
  //       type: 'category',
  //       id: 7,
  //       fromPage: 2,
  //       extract: true,
  //       infiniteScroll: 'moveNextNonVisited',
  //     },
  //   },
  // });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // actions.routeChangeSucceed({
  //   selectedItem: { type: 'post', id: 60 },
  //   context: {
  //     options: { header: 'directPost' },
  //     columns: [
  //       {
  //         items: [{ type: 'post', id: 60 }],
  //         infiniteScroll: { type: 'latest', id: 'post', fromPage: 1 },
  //       },
  //     ],
  //     infiniteSwipe: {
  //       type: 'latest',
  //       id: 'post',
  //       fromPage: 1,
  //       extract: true,
  //       infiniteScroll: { type: 'latest', id: 'post', fromPage: 1 },
  //     },
  //   },
  // });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // actions.routeChangeSucceed({
  //   selectedItem: { type: 'post', id: 60 },
  //   context: {
  //     options: { header: 'directPost' },
  //     columns: [
  //       {
  //         items: [{ type: 'post', id: 60 }],
  //         infiniteScroll: { type: 'latest', id: 'post', fromPage: 1, extract: true },
  //       },
  //       {
  //         items: [{ type: 'latest', id: 'post', page: 1 }],
  //         infiniteScroll: { type: 'latest', id: 'post', fromPage: 2 },
  //       },
  //       {
  //         items: [{ type: 'category', id: 7, page: 1 }],
  //         infiniteScroll: { type: 'category', id: 7, fromPage: 2 },
  //       },
  //       {
  //         items: [{ type: 'tag', id: 10, page: 1 }],
  //         infiniteScroll: { type: 'tag', id: 10, fromPage: 2 },
  //       },
  //     ],
  //   },
  // });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // actions.routeChangeSucceed({
  //   selectedItem: { type: 'category', id: 7, page: 5 },
  //   context: {
  //     options: { someThemeOption: 123 },
  //     columns: [
  //       {
  //         items: [{ type: 'category', id: 7, page: 5 }],
  //         infiniteScroll: { type: 'category', id: 7, fromPage: 6 },
  //       },
  //       {
  //         items: [{ type: 'latest', id: 'post', page: 1 }],
  //         infiniteScroll: { type: 'latest', id: 'post', fromPage: 2 },
  //       },
  //       {
  //         items: [{ type: 'tag', id: 10, page: 1 }],
  //         infiniteScroll: { type: 'tag', id: 10, fromPage: 2 },
  //       },
  //       {
  //         items: [{ type: 'category', id: 7, page: 1 }],
  //         infiniteScroll: { type: 'category', id: 7, fromPage: 2 },
  //       },
  //     ],
  //   },
  // });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // actions.routeChangeSucceed({
  //   selectedItem: { type: 'category', id: 7, page: 5 },
  //   context: {
  //     options: { someThemeOption: 123 },
  //     columns: [
  //       {
  //         items: [{ type: 'category', id: 7, page: 5 }],
  //         infiniteScroll: { type: 'category', id: 7, fromPage: 4 },
  //       },
  //     ],
  //     infiniteSwipeLeft: { type: 'category', id: 7, fromPage: 4 },
  //     infiniteSwipeRight: { type: 'category', id: 7, fromPage: 6 },
  //     repeatColumns: false,
  //     repeatItems: false,
  //   },
  // });

  // //////////////////////////////////////////////////////////////////////////////////////////////
});
