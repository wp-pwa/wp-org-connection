import { autorun } from 'mobx';
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

  test('Subscribe to ready before entity is ready', done => {
    expect(connection.custom('test').page(2).ready).toBe(false);
    expect(connection.custom('test').ready).toBe(false);
    autorun(() => {
      if (connection.custom('test').page(2).ready && connection.custom('test').ready) done();
    });
    connection.addCustomPage({
      name: 'test',
      page: 2,
      result: resultFromCategoryListPage2,
      entities: entitiesFromCategoryListPage2,
    });
  });

  test('Subscribe to fetching before entity is ready', done => {
    expect(connection.custom('test').page(1).fetching).toBe(false);
    expect(connection.custom('test').page(1).fetching).toBe(false);
    autorun(() => {
      if (connection.custom('test').page(1).fetching && connection.custom('test').fetching) done();
    });
    connection.fetchingCustomPage({ name: 'test', page: 1 });
    expect(connection.custom('test').page(1).ready).toBe(false);
  });

  test('Ready should remain true even if new pages are fetched', () => {
    expect(connection.custom('test').ready).toBe(false);
    expect(connection.custom('test').page(1).ready).toBe(false);
    expect(connection.custom('test').page(2).ready).toBe(false);
    connection.addCustomPage({
      name: 'test',
      page: 1,
      result: resultFromCategoryList,
      entities: entitiesFromCategoryList,
    });
    expect(connection.custom('test').ready).toBe(true);
    expect(connection.custom('test').page(1).ready).toBe(true);
    expect(connection.custom('test').page(2).ready).toBe(false);
    connection.fetchingCustomPage({ name: 'test', page: 2 });
    expect(connection.custom('test').ready).toBe(true);
    expect(connection.custom('test').page(1).ready).toBe(true);
    expect(connection.custom('test').page(2).ready).toBe(false);
  });

  test('Fetching should go back to false when new pages are fetched', () => {
    expect(connection.custom('test').fetching).toBe(false);
    expect(connection.custom('test').page(1).fetching).toBe(false);
    expect(connection.custom('test').page(2).fetching).toBe(false);
    connection.fetchingCustomPage({ name: 'test', page: 1 });
    expect(connection.custom('test').fetching).toBe(true);
    expect(connection.custom('test').page(1).fetching).toBe(true);
    connection.addCustomPage({
      name: 'test',
      page: 1,
      result: resultFromCategoryList,
      entities: entitiesFromCategoryList,
    });
    expect(connection.custom('test').fetching).toBe(false);
    expect(connection.custom('test').page(1).fetching).toBe(false);
    connection.fetchingCustomPage({ name: 'test', page: 2 });
    expect(connection.custom('test').fetching).toBe(true);
    expect(connection.custom('test').page(1).fetching).toBe(false);
    expect(connection.custom('test').page(2).fetching).toBe(true);
  });

  test('Total shapes before and after initialization', () => {
    expect(connection.custom('test').total.entities).toBe(null);
    expect(connection.custom('test').total.pages).toBe(null);
    expect(connection.custom('test').total.fetched.entities).toBe(null);
    expect(connection.custom('test').total.fetched.pages).toBe(null);
    expect(connection.custom('test').page(1).total).toBe(null);
    connection.addCustomPage({
      name: 'test',
      page: 1,
      result: resultFromCategoryList,
      entities: entitiesFromCategoryList,
      total: { entities: 6, pages: 2 },
    });
    expect(connection.custom('test').total.entities).toBe(6);
    expect(connection.custom('test').total.pages).toBe(2);
    expect(connection.custom('test').page(1).total).toBe(3);
    expect(connection.custom('test').total.fetched.entities).toBe(3);
    expect(connection.custom('test').total.fetched.pages).toBe(1);
  });

  test('Subscribe to totals', done => {
    expect(connection.custom('test').total.entities).toBe(null);
    expect(connection.custom('test').total.pages).toBe(null);
    expect(connection.custom('test').total.fetched.entities).toBe(null);
    expect(connection.custom('test').total.fetched.pages).toBe(null);
    expect(connection.custom('test').page(1).total).toBe(null);
    autorun(() => {
      if (
        connection.custom('test').total.entities === 6 &&
        connection.custom('test').total.pages === 2 &&
        connection.custom('test').page(1).total === 3 &&
        connection.custom('test').total.fetched.entities === 3 &&
        connection.custom('test').total.fetched.pages === 1
      )
        done();
    });
    connection.addCustomPage({
      name: 'test',
      page: 1,
      result: resultFromCategoryList,
      entities: entitiesFromCategoryList,
      total: { entities: 6, pages: 2 },
    });
  });
});
