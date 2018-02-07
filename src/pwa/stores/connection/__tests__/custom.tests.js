import { types, unprotect } from 'mobx-state-tree';
import * as connect from '../';

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

describe('Store › Custom', () => {
  test('Get custom snapshot when it is not ready', () => {
    expect(connection.custom('test')).toMatchSnapshot();
  });

  test('Check custom and page totals', () => {
    // expect(connection.custom('test1')).toMatchSnapshot();

    // // Views
    // expect(connection.custom('test1').page[0].total).toBe(2);
    // expect(connection.custom('test1').page[1].total).toBe(2);
    // expect(connection.custom('test1').page[7].total).toBe(2);
    // expect(connection.custom('test2').page[0].total).toBe(4);
    // expect(connection.custom('test2').page[1].total).toBe(3);
    //
    // expect(connection.custom('test1').total.fetched.entities).toBe(6);
    // expect(connection.custom('test1').total.fetched.pages).toBe(8);
    // expect(connection.custom('test2').total.fetched.entities).toBe(7);
    // expect(connection.custom('test2').total.fetched.pages).toBe(2);
  });

  // test('Check entities and page entities names', () => {
  //   const testEntities = ({ entities }) => entities.forEach(e => expect(e).toMatchSnapshot());
  //
  //   testEntities(connection.custom('test1'));
  //   testEntities(connection.custom('test2'));
  //
  //   testEntities(connection.custom('test1').page[0]);
  //   testEntities(connection.custom('test1').page[7]);
  //   testEntities(connection.custom('test2').page[0]);
  //   testEntities(connection.custom('test2').page[1]);
  // });
  //
  // test('Check CUSTOM_REQUESTED action', () => {
  //   connection[actionTypes.CUSTOM_REQUESTED](
  //     actions.customRequested({
  //       url: '/pepe',
  //       name: 'test',
  //       singleType: 'category',
  //       page: 1,
  //       params: {},
  //     }),
  //   );
  //   expect(connection.custom('test').url).toBe('/pepe');
  //   expect(connection.custom('test').params).toEqual({});
  //   expect(connection.custom('test').fetching).toBe(true);
  //   expect(connection.custom('test').ready).toBe(false);
  //   expect(connection.custom('test').page[0].fetching).toBe(true);
  //   expect(connection.custom('test').page[0].ready).toBe(false);
  //   expect(connection.custom('test').total.entities).toBe(null);
  //   expect(connection.custom('test').total.fetched.entities).toBeNull();
  //   expect(connection.custom('test').total.fetched.pages).toBe(1);
  //   expect(connection.custom('test').total.pages).toBe(null);
  //   expect(connection.custom('test').page[0].total).toBe(0);
  // });
  //
  // test('Check CUSTOM_SUCCEED action', () => {
  //   connection[actionTypes.CUSTOM_REQUESTED](
  //     actions.customRequested({
  //       url: '/pepe',
  //       name: 'test',
  //       singleType: 'category',
  //       page: 1,
  //       params: {},
  //     }),
  //   );
  //   connection[actionTypes.CUSTOM_SUCCEED](
  //     actions.customSucceed({
  //       url: '/pepe',
  //       name: 'test',
  //       singleType: 'category',
  //       page: 1,
  //       total: {
  //         entities: 7,
  //         pages: 1,
  //       },
  //       result: [1, 3, 4, 5, 6, 7, 8],
  //       entities: {
  //         category: snapshot.singleMap.category,
  //       },
  //     }),
  //   );
  //   expect(connection.custom('test').fetching).toBe(false);
  //   expect(connection.custom('test').ready).toBe(true);
  //   expect(connection.custom('test').page[0].fetching).toBe(false);
  //   expect(connection.custom('test').page[0].ready).toBe(true);
  //   expect(connection.custom('test').total.entities).toBe(7);
  //   expect(connection.custom('test').total.fetched.entities).toBe(7);
  //   expect(connection.custom('test').total.fetched.pages).toBe(1);
  //   expect(connection.custom('test').total.pages).toBe(1);
  //   expect(connection.custom('test').page[0].total).toBe(7);
  //   expect(connection.custom('test').entities[0].name).toBe('Weekend Trip');
  //   expect(connection.custom('test').entities[6].name).toBe('Travel');
  //   expect(connection.custom('test').page[0].entities[0].name).toBe('Weekend Trip');
  //   expect(connection.custom('test').page[0].entities[6].name).toBe('Travel');
  // });
  //
  // test('Check CUSTOM_FAILED action', () => {
  //   connection[actionTypes.CUSTOM_REQUESTED](
  //     actions.customRequested({
  //       url: '/pepe',
  //       name: 'test',
  //       singleType: 'category',
  //       page: 1,
  //       params: {},
  //     }),
  //   );
  //   connection[actionTypes.CUSTOM_FAILED](
  //     actions.customFailed({
  //       url: '/pepe',
  //       name: 'test',
  //       singleType: 'category',
  //       page: 1,
  //       error: new Error('Something went wrong!'),
  //       endpoint: '/pepe',
  //     }),
  //   );
  //   expect(connection.custom('test').fetching).toBe(false);
  //   expect(connection.custom('test').ready).toBe(false);
  //   expect(connection.custom('test').page[0].fetching).toBe(false);
  //   expect(connection.custom('test').page[0].ready).toBe(false);
  //   expect(connection.custom('test').total.entities).toBe(null);
  //   expect(connection.custom('test').total.fetched.entities).toBeNull();
  //   expect(connection.custom('test').total.fetched.pages).toBe(1);
  //   expect(connection.custom('test').total.pages).toBe(null);
  //   expect(connection.custom('test').page[0].total).toBe(0);
  // });
});
