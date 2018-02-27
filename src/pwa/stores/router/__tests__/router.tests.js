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
    expect(connection.selectedContext).toBeNull();
  });

  test('Selected single', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });

  test('Selected list', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selectedItem: { type: 'category', id: 7, page: 1 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
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

  test.skip('Selected single and context object with extracted', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'post', id: 60 },
        context: {
          options: { someThemeOption: 123 },
          columns: [
            { items: [{ type: 'post', id: 60 }] },
            { items: [{ type: 'latest', id: 'post', page: 1, extracted: true }] },
          ],
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });

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
