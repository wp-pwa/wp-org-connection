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

  test('Create context from selected single', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });

  test('Create context from selected list', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'category', id: 7, page: 1 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });

  test('Create context from selected single with previous context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'post', id: 63 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[1].index);
  });

  test('Create context from selected list with previous context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'category', id: 5, page: 1 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'category', id: 7, page: 1 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[1].index);
  });

  test('Create context from selected single and context object', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'post', id: 60 },
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

  test('Create context from selected single and context object without selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'post', id: 60 },
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

  test('Create context from selected list and context object', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'category', id: 7, page: 1 },
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

  test('Create context from selected list and context object without selected', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'category', id: 7, page: 1 },
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

  test('Create context from selected single with previous equal context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'post', id: 60 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'post', id: 60 } }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(connection.selectedColumn).toBe(connection.contexts[0].columns[0]);
    expect(connection.selectedItem).toBe(connection.contexts[0].columns[0].items[0]);
  });

  test('Create context from selected single and context object, with previous diff context', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({ selected: { type: 'post', id: 60 } }),
    );
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'post', id: 60 },
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

  test.skip('Create context from selected single and context object with extracted', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'post', id: 60 },
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

  test.skip('Create context from selected single and context object with duplicate items', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: { type: 'post', id: 60 },
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

  test.skip('Create context from single and extracted list', () => {
    // connection[actionTypes.ROUTE_CHANGE_SUCCEED](
    //   actions.routeChangeSucceed({ selected: { type: 'category', id: 7, page: 1 } }),
    // );
    // expect(connection.contexts).toMatchSnapshot();
    // expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });
});
