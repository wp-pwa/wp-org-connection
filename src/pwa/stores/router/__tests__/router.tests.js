/* eslint-disable */
import { transaction } from 'mobx';
import { getSnapshot } from 'mobx-state-tree';
import Connection from '../../';
import * as actionTypes from '../../../actionTypes';
import * as actions from '../../../actions';

jest.mock('uuid/v4', () => {
  let id = 0;
  return jest.fn(() => {
    id += 1;
    return `mockedId_${id}`;
  });
});

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
    expect(connection.selectedContext.getItem({ type: 'post', id: 60 }).visited).toBe(true);
    expect(connection.selectedContext.getItem({ type: 'post', id: 63 }).visited).toBe(true);
    expect(connection.selectedContext.getItem({ type: 'post', id: 62 }).visited).toBe(false);
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
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 62 },
        method: 'moveSelectedItem',
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(1);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[1]);
    expect(connection.selectedItem.id).toBe(62);
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
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        method: 'moveSelectedItem',
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(1);
    expect(connection.contexts[0].columns.length).toBe(2);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[1]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[1].items[1]);
    expect(connection.selectedItem.id).toBe(60);
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
      connection[actionTypes.ROUTE_CHANGE_SUCCEED](
        actions.routeChangeSucceed({
          selectedItem: { type: 'post', id: 60 },
          method: 'moveSelectedItem',
        }),
      ),
    ).toThrow("Can't move if selected doesn't exist in the previous context.");
  });

  test('Replace context with new one', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 63 },
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
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'latest', id: 'post', page: 1 },
        method: 'replaceContext',
        context: {
          options: { someThemeOption: 456 },
          columns: [
            [{ type: 'post', id: 63 }, { type: 'latest', id: 'post', page: 1 }],
            [{ type: 'category', id: 7, page: 1 }],
            [{ type: 'category', id: 3, page: 1 }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts.length).toBe(1);
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[1]);
    expect(connection.selectedItem.type).toBe('latest');
    expect(connection.contexts[0].columns[0].items[0].type).toBe('post');
    expect(connection.contexts[0].columns[0].items[0].id).toBe(63);
    expect(connection.contexts[0].columns[1].items[0].type).toBe('category');
    expect(connection.contexts[0].columns[1].items[0].id).toBe(7);
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
        method: 'selectItemInPreviousContext',
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
          method: 'selectItemInPreviousContext',
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
        method: 'selectItemInPreviousContext',
      }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 62 },
        method: 'selectItemInNextContext',
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
        method: 'selectItemInPreviousContext',
      }),
    );
    expect(() =>
      connection[actionTypes.ROUTE_CHANGE_SUCCEED](
        actions.routeChangeSucceed({
          selectedItem: { type: 'post', id: 63 },
          method: 'selectItemInNextContext',
        }),
      ),
    ).toThrow("You are trying to select an item in a context where doesn't exist");
  });

  test('Selected single and context object with extracted', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            [{ type: 'post', id: 60 }],
            [{ type: 'latest', id: 'post', page: 1, extract: true }],
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedContext.columns.length).toBe(1);
  });

  // //////////////////////////////////////////////////////////////////////////////////////////////
  actions.routeChangeSucceed({
    selectedItem: { type: 'post', id: 60 },
    context: {
      options: { header: 'post' },
      columns: [
        {
          items: [{ type: 'post', id: 62 }],
          infiniteScroll: 'nextNonVisited',
        },
        {
          items: [{ type: 'post', id: 63 }, { type: 'post', id: 60 }],
          infiniteScroll: 'nextNonVisited',
        },
        {
          items: [{ type: 'category', id: 7, page: 1 }],
          infiniteScroll: { type: 'category', id: 7, fromPage: 2 },
        },
      ],
      infiniteSwipe: {
        type: 'category',
        id: 7,
        extract: true,
        fromPage: 2,
        infiniteScroll: 'nextNonVisited',
      },
    },
  });
  // Launched by creator of context.
  actions.routeChangeSucceed({
    options: { header: 'post' },
    selected: { type: 'post', id: 60 },
    columns: [
      [{ type: 'post', id: 62 }],
      [{ type: 'post', id: 63 }, { type: 'post', id: 60 }],
      [{ type: 'category', id: 7, page: 1 }],
    ],
  });
  actions.addColumnsToContext({ type: 'category', id: 7, page: 2, extract: true });
  actions.listPageRequested({ type: 'category', id: 7, page: 2 });


  
  autorun(() => {
    if (connection.selectedItem.isLastNonVisited) {
      const page = untracked(() => connection.list('category', 7).nextPage.page);
      connection.selectedContext.pushColumns({ type: 'category', id: 7, page, extract: true });
      connection.list('category', 7).nextPage.fetch();
    }
  });
  // RouteWaypoint draws this on prefetching POST
  connection.selectedContext.nextNonVisitedItem;
  // Launched by RouteWaypoint POST, route change (infiniteScroll)
  const item = detach(connection.selectedContext.nextNonVisitedItem);
  connection.selectedColum.pushItem(item);
  connection.changeSelectedItem(item);
  // RouteWaypoint draws this on prefetching LIST and starts fetching
  connection.selectedItem.list.nextPage;
  connection.selectedItem.list.nextPage.fetch();
  // Launched by RouteWaypoint LIST, route change (infiniteScroll)
  const item = connection.selectedColum.pushItem(connection.selectedItem.list.nextPage);
  connection.changeSelectedItem(item);
  // When swipe right or "Next" button
  connection.changeSelectedItem(connection.nextColumn.selectedItem);
  // When swipe left or "Previous" button
  connection.changeSelectedItem(connection.previousColumn.selectedItem);

  // //////////////////////////////////////////////////////////////////////////////////////////////
  actions.routeChangeSucceed({
    selectedItem: { type: 'post', id: 60 },
    context: {
      options: { header: 'list' },
      columns: [
        {
          items: [{ type: 'category', id: 7, page: 1, extract: true }],
          infiniteScroll: 'moveNextNonVisited',
        },
      ],
      infiniteSwipe: {
        type: 'category',
        id: 7,
        fromPage: 2,
        extract: true,
        infiniteScroll: 'moveNextNonVisited',
      },
    },
  });
  // Launched by creator of context.
  connection.selectedContext = connection.createContext({
    options: { header: 'list' },
    selected: { type: 'post', id: 60 },
    columns: [{ type: 'category', id: 7, page: 1, extract: true }],
  });
  autorun(() => {
    if (connection.selectedItem.isLastNonVisited) {
      const page = untracked(() => connection.list('category', 7).nextPage.page);
      connection.selectedContext.pushColumns({ type: 'category', id: 7, page, extract: true });
      connection.list('latest', 'post').nextPage.fetch();
    }
  });
  // RouteWaypoint draws this on prefetching
  connection.selectedContext.nextNonVisitedItem;
  // Launched by RouteWaypoint, route change (infiniteScroll)
  const item = detach(connection.selectedContext.nextNonVisitedItem);
  connection.selectedColum.pushItem(item);
  connection.changeSelectedItem(item);
  // When swipe right or "Next" button
  connection.changeSelectedItem(connection.nextColumn.selectedItem);
  // When swipe left or "Previous" button
  connection.changeSelectedItem(connection.previousColumn.selectedItem);

  // //////////////////////////////////////////////////////////////////////////////////////////////
  actions.routeChangeSucceed({
    selectedItem: { type: 'post', id: 60 },
    context: {
      options: { header: 'directPost' },
      columns: [
        {
          items: [{ type: 'post', id: 60 }],
          infiniteScroll: { type: 'latest', id: 'post', fromPage: 1 },
        },
      ],
      infiniteSwipe: {
        type: 'latest',
        id: 'post',
        fromPage: 1,
        extract: true,
        infiniteScroll: { type: 'latest', id: 'post', fromPage: 1 },
      },
    },
  });
  // Launched by creator of context.
  connection.selectedContext = connection.createContext({
    options: { header: 'directPost' },
    columns: [[{ type: 'post', id: 60 }], [{ type: 'latest', id: 'post', page: 1, extract: true }]],
    allowRepeatedItems: false,
  });
  autorun(() => {
    if (connection.selectedItem.isLastNonVisited) {
      const page = untracked(() => connection.list('latest', 'post').nextPage.page);
      connection.selectedContext.pushColumns({ type: 'latest', id: 'post', page, extract: true });
      connection.list('latest', 'post').nextPage.fetch();
    }
  });
  // RouteWaypoint draws this on prefetching
  connection.selectedContext.nextNonVisitedItem;
  // Launched by RouteWaypoint, route change (infiniteScroll)
  const item = detach(connection.selectedContext.nextNonVisitedItem);
  connection.selectedColum.pushItem(item);
  connection.changeSelectedItem(item);
  // When swipe right or button of "Next page"
  connection.changeSelectedItem(connection.nextColumn.selectedItem);
  // When swipe left or button of "Previous page"
  connection.changeSelectedItem(connection.previousColumn.selectedItem);

  // //////////////////////////////////////////////////////////////////////////////////////////////
  actions.routeChangeSucceed({
    selectedItem: { type: 'post', id: 60 },
    context: {
      options: { header: 'directPost' },
      columns: [
        {
          items: [{ type: 'post', id: 60 }],
          infiniteScroll: { type: 'latest', id: 'post', fromPage: 1, extract: true },
        },
        {
          items: [{ type: 'latest', id: 'post', page: 1 }],
          infiniteScroll: { type: 'latest', id: 'post', fromPage: 2 },
        },
        {
          items: [{ type: 'category', id: 7, page: 1 }],
          infiniteScroll: { type: 'category', id: 7, fromPage: 2 },
        },
        {
          items: [{ type: 'tag', id: 10, page: 1 }],
          infiniteScroll: { type: 'tag', id: 10, fromPage: 2 },
        },
      ],
    },
  });
  // Launched by creator of context.
  connection.selectedContext = connection.createNewContext({
    options: { header: 'directPost' },
    select: { type: 'post', id: 60 },
    columns: [
      [{ type: 'post', id: 60 }],
      [{ type: 'latest', id: 'post', page: 1 }],
      [{ type: 'category', id: 7, page: 1 }],
      [{ type: 'tag', id: 10, page: 1 }],
    ],
  });
  autorun(() => connection.nextColumn.selectedItem.fetch())
  autorun(() => connection.previousColumn.selectedItem.fetch())
  // Launched by RouteWaypoint of post 60, preload (infiniteScroll)
  const list = connection.selectedContext.createList({ type: 'latest', id: 'post', page: 1 });
  // Launched by RouteWaypoint of post 60, route change (infiniteScroll)
  when(
    () => list.ready,
    () => {
      connection.selectedColum.pushItem(list.selectedItem);
      connection.changeSelectedItem(list.selectedItem);
      list.selectedItem = list.selectedItem.nextItem;
      if (list.selectedItem.isLast) list.nextPage.fetch();
    },
  );
  // Launched by RouteWaypoint of the lists, preload (infiniteScroll)
  connection.selectedItem.nextPage.fetch();
  // Launched by RouteWaypoint of the lists, route change (infiniteScroll)
  connection.selectedColumn.pushItem(connection.selectedItem.nextPage);
  connection.changeSelectedItem(connection.selectedColumn.nextItem);
  // When swipe right or button of "Next page"
  if (connection.nextColumn) connection.changeSelectedItem(connection.nextColumn.selectedItem);
  // When swipe left or button of "Previous page"
  if (connection.previousColumn)
    connection.changeSelectedItem(connection.previousColumn.selectedItem);

  // //////////////////////////////////////////////////////////////////////////////////////////////
  actions.routeChangeSucceed({
    selectedItem: { type: 'category', id: 7, page: 5 },
    context: {
      options: { someThemeOption: 123 },
      columns: [
        {
          items: [{ type: 'category', id: 7, page: 5 }],
          infiniteScroll: { type: 'category', id: 7, fromPage: 6 },
        },
        {
          items: [{ type: 'latest', id: 'post', page: 1 }],
          infiniteScroll: { type: 'latest', id: 'post', fromPage: 2 },
        },
        {
          items: [{ type: 'tag', id: 10, page: 1 }],
          infiniteScroll: { type: 'tag', id: 10, fromPage: 2 },
        },
        {
          items: [{ type: 'category', id: 7, page: 1 }],
          infiniteScroll: { type: 'category', id: 7, fromPage: 2 },
        },
      ],
    },
  });

  // Launched by creator of context.
  const context = connection.createNewContext({
    options: { header: 'list' },
    columns: [
      [{ type: 'category', id: 7, page: 5 }],
      [{ type: 'latest', id: 'post', page: 1 }],
      [{ type: 'tag', id: 10, page: 1 }],
      [{ type: 'category', id: 7, page: 1 }],
    ],
  });
  const item = context.getItem({ type: 'category', id: 7, page: 5 });
  connection.changeSelectedItem(item);
  // On each changeSelectedItem;
  connection.selectedItem.fetch();
  if (connection.nextColumn) connection.nextColumn.selectedItem.fetch();
  if (connection.previousColumn) connection.previousColumn.selectedItem.fetch();
  // Launched by RouteWaypoint, preload (infiniteScroll)
  connection.selectedItem.nextPage.fetch();
  // Launched by RouteWaypoint, route change (infiniteScroll)
  connection.selectedColumn.pushItem(connection.selectedItem.nextPage);
  connection.changeSelectedItem(connection.selectedColumn.nextItem);
  // When swipe right or button of "Next page"
  connection.changeSelectedItem(connection.nextColumn.selectedItem);
  // When swipe left or button of "Previous page"
  connection.changeSelectedItem(connection.previousColumn.selectedItem);

  // //////////////////////////////////////////////////////////////////////////////////////////////
  actions.routeChangeSucceed({
    selectedItem: { type: 'category', id: 7, page: 5 },
    context: {
      options: { someThemeOption: 123 },
      columns: [
        {
          items: [{ type: 'category', id: 7, page: 5 }],
          infiniteScroll: { type: 'category', id: 7, fromPage: 4 },
        },
      ],
      infiniteSwipeLeft: { type: 'category', id: 7, fromPage: 4 },
      infiniteSwipeRight: { type: 'category', id: 7, fromPage: 6 },
      repeatColumns: false,
      repeatItems: false,
    },
  });

  // Launched by creator of context.
  const context = connection.createNewContext({
    options: { header: 'list' },
    columns: [[{ type: 'category', id: 7, page: 5 }]],
  });
  const item = context.getItem({ type: 'category', id: 7, page: 5 });
  connection.changeSelectedItem(item);
  // Launched by last component (infiniteSwipeRight)
  if (connection.selectedItem.nextPage) {
    connection.selectedContext.pushColumn([connection.selectedItem.nextPage]);
    connection.selectedItem.nextPage.fetch();
  }
  // Launched by first component (infiniteSwipeLeft)
  if (connection.selectedItem.previousPage) {
    connection.selectedContext.unshiftColumn([connection.selectedItem.previousPage]);
    connection.selectedItem.previousPage.fetch();
  }
  // Launched by RouteWaypoint, route change (infiniteScroll)
  if (connection.selectedItem.nextPage)
    transaction(() => {
      connection.selectedContext.deleteItem(connection.selectedItem.nextPage);
      connection.selectedColumn.pushItem(connection.selectedItem.nextPage);
    });
  connection.changeSelectedItem(connection.selectedItem.nextPage);
  // When swipe right or button of "Next page"
  connection.changeSelectedItem(connection.selectedItem.nextPage);
  // When swipe left or button of "Previous page"
  connection.changeSelectedItem(connection.selectedItem.previousPage);

  // //////////////////////////////////////////////////////////////////////////////////////////////
  test.skip('Selected single and context object with duplicate items', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            { items: [{ type: 'post', id: 63 }] },
            { items: [{ type: 'post', id: 63 }, { type: 'post', id: 60 }] },
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.contexts[0].columns[1].items.length).toBe(1);
    expect(connection.contexts[0].columns[1].items[0].id).toBe(60);
  });

  test.skip('Single and extracted list', () => {
    // connection[actionTypes.ROUTE_CHANGE_SUCCEED](
    //   actions.routeChangeSucceed({ selectedItem: { type: 'category', id: 7, page: 1 } }),
    // );
    // expect(connection.contexts).toMatchSnapshot();
    // expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });
});
