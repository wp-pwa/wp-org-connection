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
      actions.routeChangeSucceed({
        selected: {
          type: 'post',
          id: 60,
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });
  test('Create context from selected list', () => {
    connection[actionTypes.ROUTE_CHANGE_SUCCEED](
      actions.routeChangeSucceed({
        selected: {
          type: 'category',
          id: 70,
          page: 1,
        },
      }),
    );
    expect(connection.contexts).toMatchSnapshot();
    expect(getSnapshot(connection).selectedContext).toBe(connection.contexts[0].index);
  });
});
