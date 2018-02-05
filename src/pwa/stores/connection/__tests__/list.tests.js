/* eslint-disable dot-notation */
import { autorun } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import { list } from '../../../schemas';
import postsFromCategory7 from '../../../__tests__/posts-from-category-7.json';
import postsFromCategory7Page2 from '../../../__tests__/posts-from-category-7-page-2.json';

const { result: resultFromCategory7, entities: entitiesFromCategory } = normalize(
  postsFromCategory7,
  list,
);

const { result: resultFromCategory7Page2, entities: entitiesFromCategoryPage2 } = normalize(
  postsFromCategory7Page2,
  list,
);

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

describe('Store › List', () => {
  test('Get list snapshot when entity is not ready', () => {
    expect(connection.list('category', 7)).toMatchSnapshot();
  });

  test('Get list shape when entity is not ready', () => {
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).pages).toEqual([]);
    expect(connection.list('category', 7).page(2).ready).toBe(false);
    expect(connection.list('category', 7).page(2).entities).toEqual([]);
    expect(connection.list('category', 7).pages).toEqual([]);
    expect(connection.list('category', 7).entity.id).toBe(7);
    expect(connection.list('category', 7).entity.link).toBe('/?cat=7');
    expect(connection.list('tag', 10).entity.link).toBe('/?tag_ID=10');
    expect(connection.list('latest', 'post').entity.link).toBe('/');
    expect(connection.list('category', 7).entity.pagedLink(7)).toBe('/?cat=7&paged=7');
    expect(connection.list('latest', 'post').entity.pagedLink(7)).toBe('/page/7');
    expect(connection.list('author', 4).entity.avatar).toBe('');
  });

  test('Get list entity shapes after adding a page', () => {
    expect(connection.list('category', 7).entities).toEqual([]);
    expect(connection.list('category', 7).page(1).entities).toEqual([]);
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    });
    const results = [57, 54, 42, 36, 33];
    expect(connection.list('category', 7).entities.map(entity => entity.id)).toEqual(results);
    expect(
      connection
        .list('category', 7)
        .page(1)
        .entities.map(entity => entity.id),
    ).toEqual(results);
    expect(connection.list('category', 7).entities[0].id).toBe(57);
    expect(connection.list('category', 7).entities[0].title).toBe('Shinjuku Gyoen National Garden');
    expect(connection.list('category', 7).page(1).entities[0].id).toBe(57);
    expect(connection.list('category', 7).page(1).entities[0].title).toBe(
      'Shinjuku Gyoen National Garden',
    );
    expect(connection.list('category', 7).pages[0].entities[0].id).toBe(57);
    expect(connection.list('category', 7).pages[0].entities[0].title).toBe(
      'Shinjuku Gyoen National Garden',
    );
  });

  test('Get list entity shapes after adding two pages', () => {
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    });
    connection.addPage({
      type: 'category',
      id: 7,
      page: 2,
      result: resultFromCategory7Page2,
      entities: entitiesFromCategoryPage2,
    });
    const page1 = [57, 54, 42, 36, 33];
    const page2 = [30, 26, 23, 12, 1];
    expect(connection.list('category', 7).entities.map(entity => entity.id)).toEqual([
      ...page1,
      ...page2,
    ]);
    expect(
      connection
        .list('category', 7)
        .page(2)
        .entities.map(entity => entity.id),
    ).toEqual(page2);
    expect(connection.list('category', 7).entities[5].id).toBe(30);
    expect(connection.list('category', 7).entities[5].title).toBe('Machu Picchu');
    expect(connection.list('category', 7).page(2).entities[0].id).toBe(30);
    expect(connection.list('category', 7).page(2).entities[0].title).toBe('Machu Picchu');
    expect(connection.list('category', 7).pages[1].entities[0].id).toBe(30);
    expect(connection.list('category', 7).pages[1].entities[0].title).toBe('Machu Picchu');
  });

  test('Subscribe to ready (in page) before entity is ready', done => {
    expect(connection.list('category', 7).page(2).ready).toBe(false);
    autorun(() => {
      if (connection.list('category', 7).page(2).ready) done();
    });
    connection.addPage({
      type: 'category',
      id: 7,
      page: 2,
      result: resultFromCategory7Page2,
      entities: entitiesFromCategoryPage2,
    });
  });

  test('Subscribe to ready before entity is ready', done => {
    expect(connection.list('category', 7).ready).toBe(false);
    autorun(() => {
      if (connection.list('category', 7).ready) done();
    });
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    });
  });

  test('Subscribe to fetching (in page) before entity is ready', done => {
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    autorun(() => {
      if (connection.list('category', 7).page(1).fetching) done();
    });
    connection.fetchingPage({ type: 'category', id: 7, page: 1 });
    expect(connection.list('category', 7).page(1).ready).toBe(false);
  });

  test('Subscribe to fetching before entity is ready', done => {
    expect(connection.list('category', 7).fetching).toBe(false);
    autorun(() => {
      if (connection.list('category', 7).fetching) done();
    });
    connection.fetchingPage({ type: 'category', id: 7, page: 1 });
    expect(connection.list('category', 7).ready).toBe(false);
  });

  test('Ready should remain true even if new pages are fetched', () => {
    expect(connection.list('category', 7).ready).toBe(false);
    expect(connection.list('category', 7).page(1).ready).toBe(false);
    expect(connection.list('category', 7).page(2).ready).toBe(false);
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    });
    expect(connection.list('category', 7).ready).toBe(true);
    expect(connection.list('category', 7).page(1).ready).toBe(true);
    expect(connection.list('category', 7).page(2).ready).toBe(false);
    connection.fetchingPage({ type: 'category', id: 7, page: 2 });
    expect(connection.list('category', 7).ready).toBe(true);
    expect(connection.list('category', 7).page(1).ready).toBe(true);
    expect(connection.list('category', 7).page(2).ready).toBe(false);
  });

  test('Fetching should go back to false when new pages are fetched', () => {
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    expect(connection.list('category', 7).page(2).fetching).toBe(false);
    connection.fetchingPage({ type: 'category', id: 7, page: 1 });
    expect(connection.list('category', 7).fetching).toBe(true);
    expect(connection.list('category', 7).page(1).fetching).toBe(true);
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
    });
    expect(connection.list('category', 7).fetching).toBe(false);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    connection.fetchingPage({ type: 'category', id: 7, page: 2 });
    expect(connection.list('category', 7).fetching).toBe(true);
    expect(connection.list('category', 7).page(1).fetching).toBe(false);
    expect(connection.list('category', 7).page(2).fetching).toBe(true);
  });

  test('Total shapes before and after initialization', () => {
    expect(connection.list('category', 7).total.entities).toBe(null);
    expect(connection.list('category', 7).total.pages).toBe(null);
    expect(connection.list('category', 7).total.fetched.entities).toBe(null);
    expect(connection.list('category', 7).total.fetched.pages).toBe(null);
    expect(connection.list('category', 7).page(1).total).toBe(null);
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
      total: { entities: 10, pages: 2 },
    });
    expect(connection.list('category', 7).total.entities).toBe(10);
    expect(connection.list('category', 7).total.pages).toBe(2);
    expect(connection.list('category', 7).page(1).total).toBe(5);
    expect(connection.list('category', 7).total.fetched.entities).toBe(5);
    expect(connection.list('category', 7).total.fetched.pages).toBe(1);
  });

  test('Subscribe to totals', done => {
    expect(connection.list('category', 7).total.entities).toBe(null);
    expect(connection.list('category', 7).total.pages).toBe(null);
    expect(connection.list('category', 7).total.fetched.entities).toBe(null);
    expect(connection.list('category', 7).total.fetched.pages).toBe(null);
    expect(connection.list('category', 7).page(1).total).toBe(null);
    autorun(() => {
      if (
        connection.list('category', 7).total.entities === 10 &&
        connection.list('category', 7).total.pages === 2 &&
        connection.list('category', 7).page(1).total === 5 &&
        connection.list('category', 7).total.fetched.entities === 5 &&
        connection.list('category', 7).total.fetched.pages === 1
      )
        done();
    });
    connection.addPage({
      type: 'category',
      id: 7,
      page: 1,
      result: resultFromCategory7,
      entities: entitiesFromCategory,
      total: { entities: 10, pages: 2 },
    });
  });
});
