// import { autorun } from 'mobx';
import { getSnapshot } from 'mobx-state-tree';
// import { normalize } from 'normalizr';
// import { entity, list } from '../../../schemas';
import Connection from '../../';
import * as actionTypes from '../../../actionTypes';
import * as actions from '../../../actions';
import { actions as historyActions } from '../history';
// import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
// import post60 from '../../../__tests__/post-60.json';

// const { result: resultFromCategory7, entities: entitiesFromCategory } = normalize(
//   postsFromCategory7,
//   list,
// );

// const { entities: entitiesFromPost60 } = normalize(post60, entity);

let connection;
beforeEach(() => {
  connection = Connection.actions(historyActions).create({});
  connection[actionTypes.ROUTE_CHANGE_SUCCEED](
    actions.routeChangeSucceed({
      selectedItem: { type: 'category', id: 7, page: 1 },
      context: {
        columns: [
          [{ type: 'category', id: 7, page: 1 }, { type: 'category', id: 7, page: 2 }],
          [{ type: 'post', id: 63 }],
          [{ type: 'post', id: 60 }],
        ],
      },
    }),
  );
});

describe('Connection › Router > History', () => {
  test('Initializes url if not populated', () => {
    const { key, ...rest } = connection.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('Initializes url if populated', () => {
    const extendedConnection = Connection.actions(historyActions).create(getSnapshot(connection));
    const { key, ...rest } = extendedConnection.history.location;
    expect(rest).toMatchSnapshot();
  });

  test('dispatchs ROUTE_CHANGE_SUCCEED when push or replace', () => {
    const dispatch = jest.fn();
    const extendedConnection = Connection.actions(historyActions).create(getSnapshot(connection), {
      dispatch,
    });
    extendedConnection[actionTypes.ROUTE_CHANGE_REQUESTED](
      actions.routeChangeSucceed({
        selectedItem: { type: 'category', id: 7, page: 2 },
      }),
    );
    const { key, ...rest } = extendedConnection.history.location;
    expect(rest).toMatchSnapshot();
    expect(dispatch.mock.calls.length).toBe(1);
    expect(dispatch.mock.calls[0]).toMatchSnapshot();
  });

  test('Url updates when items is ready');
  test('backward');
  test('Forward');
  test('go to previous context');
});
