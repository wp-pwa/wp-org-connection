import Connection from '..';
import * as actions from '../../actions';
import * as actionTypes from '../../actionTypes';

let connection;
beforeEach(() => {
  connection = Connection.create({});
})

test('routeChangeSucceed should initializate the selected latest', () => {
  connection[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { listType: 'latest' }
  }))
  expect(connection.list.latest.post.ready).toBe(false);
  expect(connection.list.latest.post.fetching).toBe(false);
  expect(connection.list.latest.post.page[0].ready).toBe(false);
  expect(connection.list.latest.post.page[0].fetching).toBe(false);
});

test('routeChangeSucceed should initializate the selected list', () => {
  connection[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { listType: 'category', listId: 7, page: 2 }
  }))
  expect(connection.list.category[7].ready).toBe(false);
  expect(connection.list.category[7].fetching).toBe(false);
  expect(connection.list.category[7].page[1].ready).toBe(false);
  expect(connection.list.category[7].page[1].fetching).toBe(false);
});

test('routeChangeSucceed should initializate the selected entity', () => {
  connection[actionTypes.ROUTE_CHANGE_SUCCEED](actions.routeChangeSucceed({
    selected: { singleType: 'post', singleId: 60 }
  }))
  expect(connection.single.post[60].ready).toBe(false);
  expect(connection.single.post[60].fetching).toBe(false);
});
