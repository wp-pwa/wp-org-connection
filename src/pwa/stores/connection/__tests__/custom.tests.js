import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import { list } from '../../../schemas';
import categoriesList from '../../../__tests__/categories-list.json';
import categoriesListPage2 from '../../../__tests__/categories-list-page-2.json';

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

const { result: resultFromCategoryList, entities: entitiesFromCategoryList } = normalize(
  categoriesList,
  list,
);

const { result: resultFromCategoryListPage2, entities: entitiesFromCategoryListPage2 } = normalize(
  categoriesListPage2,
  list,
);

describe('Store › Custom', () => {
  test('Get custom snapshot when it is not ready', () => {
    expect(connection.custom('test')).toMatchSnapshot();
  });

  test('Get custom shape when entity is not ready', () => {
    expect(connection.custom('test').ready).toBe(false);
    expect(connection.custom('test').pages).toEqual([]);
    expect(connection.custom('test').page(2).ready).toBe(false);
    expect(connection.custom('test').page(2).entities).toEqual([]);
    expect(connection.custom('test').pages).toEqual([]);
    expect(connection.custom('test').name).toBe('test');
    expect(connection.custom('test').url).toBe('/');
    expect(connection.custom('test').params).toEqual({});
  });

  test('Get custom entity shapes after adding a page', () => {
    expect(connection.custom('test').entities).toEqual([]);
    expect(connection.custom('test').page(1).entities).toEqual([]);
    connection.addCustomPage({
      name: 'test',
      page: 1,
      result: resultFromCategoryList,
      entities: entitiesFromCategoryList,
    });
    const results = [5, 4, 6];
    expect(connection.custom('test').entities.map(entity => entity.id)).toEqual(results);
    expect(
      connection
        .custom('test')
        .page(1)
        .entities.map(entity => entity.id),
    ).toEqual(results);
    expect(connection.custom('test').entities[0].id).toBe(5);
    expect(connection.custom('test').entities[0].name).toBe('Architecture');
    expect(connection.custom('test').page(1).entities[0].id).toBe(5);
    expect(connection.custom('test').page(1).entities[0].name).toBe('Architecture');
    expect(connection.custom('test').pages[0].entities[0].id).toBe(5);
    expect(connection.custom('test').pages[0].entities[0].name).toBe('Architecture');
  });

  test('Get list entity shapes after adding two pages', () => {
    connection.addCustomPage({
      name: 'test',
      page: 1,
      result: resultFromCategoryList,
      entities: entitiesFromCategoryList,
    });
    connection.addCustomPage({
      name: 'test',
      page: 2,
      result: resultFromCategoryListPage2,
      entities: entitiesFromCategoryListPage2,
    });
    const page1 = [5, 4, 6];
    const page2 = [7, 3, 8];
    expect(connection.custom('test').entities.map(entity => entity.id)).toEqual([
      ...page1,
      ...page2,
    ]);
    expect(
      connection
        .custom('test')
        .page(2)
        .entities.map(entity => entity.id),
    ).toEqual(page2);
    expect(connection.custom('test').entities[3].id).toBe(7);
    expect(connection.custom('test').entities[3].name).toBe('Nature');
    expect(connection.custom('test').page(2).entities[0].id).toBe(7);
    expect(connection.custom('test').page(2).entities[0].name).toBe('Nature');
    expect(connection.custom('test').pages[1].entities[0].id).toBe(7);
    expect(connection.custom('test').pages[1].entities[0].name).toBe('Nature');
  });

  // test('Check custom and page totals', () => {
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
  // });

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
