import { getSnapshot } from 'mobx-state-tree';
import { autorun } from 'mobx';
import { normalize } from 'normalizr';
import Conn from '../../';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
import postsFromCategory7Page2 from '../../../__tests__/posts-from-category-7-page-2.json';
import { list } from '../../../schemas';
import { actions as historyActions } from '../history';
import * as actions from '../../../actions';
import * as actionTypes from '../../../actionTypes';

const { result: resultFromCategory7, entities: entitiesFromCategory } = normalize(
  postsFromCategory7,
  list,
);

const { result: resultFromCategory7Page2, entities: entitiesFromCategoryPage2 } = normalize(
  postsFromCategory7Page2,
  list,
);

// Adds history actions to Connection model.
const Connection = Conn.actions(historyActions);

// Returns a snapshot as the initial state.
const initialStateMock = () => {
  const connection = Connection.create({});
  connection.addListPage({
    type: 'category',
    id: 7,
    page: 1,
    result: resultFromCategory7,
    entities: entitiesFromCategory,
  });
  connection.addListPage({
    type: 'category',
    id: 7,
    page: 2,
    result: resultFromCategory7Page2,
    entities: entitiesFromCategoryPage2,
  });
  connection[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selectedItem: { type: 'category', id: 7, page: 1 },
      context: {
        columns: [
          [{ type: 'category', id: 7, page: 1 }, { type: 'category', id: 7, page: 2 }],
          [{ type: 'post', id: 57 }],
          [{ type: 'post', id: 54 }],
        ],
      },
    }),
  );
  return getSnapshot(connection);
};

// Stores the initial state
const initialState = initialStateMock();

// Tests
describe('Connection › Router > History', () => {
  test('Initializes blank if not populated', () => {
    const connection = Connection.create({});
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('Initializes url if populated', () => {
    const connection = Connection.create(initialState);
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
  });

  test("dispatchs succeed when 'push' (history length increases)", () => {
    const dispatch = jest.fn();
    const connection = Connection.create(initialState, { dispatch });
    connection[actionTypes.ROUTE_CHANGE_REQUESTED](
      actions.routeChangeSucceed({
        method: 'push',
        selectedItem: { type: 'category', id: 7, page: 2 },
      }),
    );
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history.length).toBe(2);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test("dispatchs succeed when 'replace' (same history length)", () => {
    const dispatch = jest.fn();
    const connection = Connection.create(initialState, { dispatch });
    connection[actionTypes.ROUTE_CHANGE_REQUESTED](
      actions.routeChangeSucceed({
        method: 'replace',
        selectedItem: { type: 'category', id: 7, page: 2 },
      }),
    );
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history.length).toBe(1);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test.skip('ignores ROUTE_CHANGE_SUCCEED when replacing (history.length + 1)', () => {
    const dispatch = jest.fn();
    const connection = Connection.create(initialState, { dispatch });
    connection[actionTypes.ROUTE_CHANGE_REQUESTED](
      actions.routeChangeSucceed({
        method: 'push',
        selectedItem: { type: 'category', id: 7, page: 2 },
      }),
    );
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
    expect(connection.history.length).toBe(2);
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test('Url updates when items is ready, and dispatch is not sent again');
  test('backward');
  test('Forward');
  test('go to previous context');
});
