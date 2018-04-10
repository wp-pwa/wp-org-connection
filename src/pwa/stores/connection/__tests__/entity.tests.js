/* eslint-disable no-restricted-syntax */
import { autorun, observable } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import post60 from '../../../__tests__/post-60.json';
import page184 from '../../../__tests__/page-with-subpage.json';
import page211 from '../../../__tests__/page-211.json';
import { entity } from '../../../schemas';
import convert from '../../../converters';

const { entities } = normalize(post60, entity);

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

describe('Connection › Entity', () => {
  test('Get entity shape when entity is not ready', () => {
    expect(connection.entity('someType', 'someId')).toMatchSnapshot();
  });

  test('Get single shape when entity is not ready', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('post', 60).fetching).toBe(false);
    expect(connection.entity('post', 60).title).toBe('');
    expect(connection.entity('post', 60).link).toBe('/?p=60');
    expect(() => connection.entity('post', 60).pagedLink(3)).toThrow();
    expect(connection.entity('post', 60).taxonomy('category')).toEqual(observable([]));
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    expect(connection.entity('post', 60).featured.sizes).toEqual(observable([]));
    expect(connection.entity('post', 60).author.name).toBe('');
  });

  test('Get taxonomy shape when entity is not ready', () => {
    expect(connection.entity('category', 3).ready).toBe(false);
    expect(connection.entity('category', 3).name).toBe('');
    expect(connection.entity('category', 3).link).toBe('/?cat=3');
    expect(connection.entity('category', 3).pagedLink(1)).toBe('/?cat=3');
    expect(connection.entity('category', 3).pagedLink(3)).toBe('/?cat=3&paged=3');
  });

  test('Get taxonomy shape when entity is not ready', () => {
    expect(connection.entity('tag', 10).ready).toBe(false);
    expect(connection.entity('tag', 10).name).toBe('');
    expect(connection.entity('tag', 10).link).toBe('/?tag_ID=10');
    expect(connection.entity('tag', 10).pagedLink(1)).toBe('/?tag_ID=10');
    expect(connection.entity('tag', 10).pagedLink(3)).toBe('/?tag_ID=10&paged=3');
  });

  test('Get author shape when entity is not ready', () => {
    expect(connection.entity('author', 4).ready).toBe(false);
    expect(connection.entity('author', 4).name).toBe('');
    expect(connection.entity('author', 4).avatar).toBe('');
    expect(connection.entity('author', 4).link).toBe('/?author=4');
    expect(connection.entity('author', 4).pagedLink(1)).toBe('/?author=4');
    expect(connection.entity('author', 4).pagedLink(2)).toBe('/?author=4&paged=2');
  });

  test('Get latest post taxonomy shape when entity is not ready', () => {
    expect(connection.entity('latest', 'post').ready).toBe(false);
    expect(connection.entity('latest', 'post').name).toBe('');
    expect(connection.entity('latest', 'post').link).toBe('/');
    expect(connection.entity('latest', 'post').pagedLink(1)).toBe('/');
    expect(connection.entity('latest', 'post').pagedLink(3)).toBe('/page/3');
  });

  test('Get latest movie taxonomy shape when entity is not ready', () => {
    expect(connection.entity('latest', 'movie').ready).toBe(false);
    expect(connection.entity('latest', 'movie').name).toBe('');
    expect(connection.entity('latest', 'movie').link).toBe('/');
    expect(connection.entity('latest', 'movie').pagedLink(1)).toBe('/');
    expect(connection.entity('latest', 'movie').pagedLink(3)).toBe('/page/3');
  });

  test('Get media shape when entity is not ready', () => {
    expect(connection.entity('media', 62).ready).toBe(false);
    expect(connection.entity('media', 62).link).toBe('/?attachement_id=62');
    expect(() => connection.entity('media', 62).pagedLink(2)).toThrow();
    expect(connection.entity('media', 62).author.name).toBe('');
    expect(connection.entity('media', 62).original.height).toBe(null);
    expect(connection.entity('media', 62).sizes).toEqual(observable([]));
  });

  test("Don't add an entity if it doesn't have type or id", () => {
    expect(connection.entity('media', 42).ready).toBe(false);
    connection.addEntity({ entity: { type: 'media' } });
    connection.addEntity({ entity: { id: 42 } });
  });

  test('Subscribe to ready before entity is ready', done => {
    expect(connection.entity('post', 60).ready).toBe(false);
    autorun(() => {
      if (connection.entity('post', 60).ready) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to link before entity is ready', done => {
    expect(connection.entity('post', 60).link).toBe('/?p=60');
    autorun(() => {
      if (
        connection.entity('post', 60).link === 'https://demo.worona.org/the-beauties-of-gullfoss/'
      )
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to paged link before entity is ready', done => {
    expect(connection.entity('category', 3).pagedLink(2)).toBe('/?cat=3&paged=2');
    autorun(() => {
      if (
        connection.entity('category', 3).pagedLink(2) ===
          'https://demo.worona.org/wp-cat/photography/page/2' &&
        connection.entity('category', 3).pagedLink(1) ===
          'https://demo.worona.org/wp-cat/photography/'
      )
        done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Subscribe to single fields before entity is ready', done => {
    expect(connection.entity('post', 60).title).toBe('');
    autorun(() => {
      if (connection.entity('post', 60).title === 'The Beauties of Gullfoss') done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Fetching should be false after item is added', () => {
    expect(connection.entity('post', 60).fetching).toBe(false);
    connection.fetchingEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).fetching).toBe(true);
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).fetching).toBe(false);
  });

  test('Subscribe to fetching from false to true', done => {
    expect(connection.entity('post', 60).fetching).toBe(false);
    autorun(() => {
      if (connection.entity('post', 60).fetching) done();
    });
    connection.fetchingEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).ready).toBe(false);
  });

  test('Subscribe to fetching from true to false', done => {
    connection.fetchingEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).fetching).toBe(true);
    autorun(() => {
      if (!connection.entity('post', 60).fetching) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Shape should be the same after fetching is started', () => {
    const authorId1 = connection.entity('post', 60).author.id;
    connection.fetchingEntity({ type: 'post', id: 60 });
    const authorId2 = connection.entity('post', 60).author.id;
    expect(authorId1).toEqual(authorId2);
    const featuredOriginal1 = connection.entity('post', 60).featured.original.url;
    connection.fetchingEntity({ type: 'post', id: 60 });
    const featuredOriginal2 = connection.entity('post', 60).featured.original.url;
    expect(featuredOriginal1).toEqual(featuredOriginal2);
    const link1 = connection.entity('post', 60).link;
    connection.fetchingEntity({ type: 'post', id: 60 });
    const link2 = connection.entity('post', 60).link;
    expect(link1).toEqual(link2);
    const taxonomies1 = connection.entity('post', 60).taxonomy('category');
    connection.fetchingEntity({ type: 'post', id: 60 });
    const taxonomies2 = connection.entity('post', 60).taxonomy('category');
    expect(taxonomies1).toEqual(taxonomies2);
  });

  test('Get taxonomies inside post before taxonomies are ready', () => {
    expect(connection.entity('post', 60).taxonomy('category').length).toBe(0);
    expect(connection.entity('post', 60).taxonomy('tag').length).toBe(0);
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).taxonomy('category').length).toBe(2);
    expect(connection.entity('post', 60).taxonomy('category')[0].id).toBe(3);
    expect(connection.entity('post', 60).taxonomy('tag').length).toBe(4);
    expect(connection.entity('post', 60).taxonomy('tag')[1].id).toBe(9);
  });

  test('Subscribe to taxonomies array before entity is ready', done => {
    expect(connection.entity('post', 60).taxonomy('category').length).toBe(0);
    autorun(() => {
      if (connection.entity('post', 60).taxonomy('category').length === 2) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to taxonomies array fields before entity is ready', done => {
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).taxonomy('category').length).toBe(2);
    expect(connection.entity('post', 60).taxonomy('category')[0].id).toBe(3);
    expect(connection.entity('post', 60).taxonomy('category')[0].name).toBe('');
    autorun(() => {
      if (connection.entity('post', 60).taxonomy('category')[0].name === 'Photography') done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Get featured inside post before entity is ready', () => {
    expect(connection.entity('post', 60).featured.id).toBe(null);
    expect(connection.entity('post', 60).featured.sizes).toEqual(observable([]));
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).featured.id).toBe(62);
    expect(connection.entity('post', 60).featured.title).toBe('');
  });

  test('Subscribe to featured fields before entity is ready', done => {
    expect(connection.entity('post', 60).featured.original.width).toBe(null);
    autorun(() => {
      if (connection.entity('post', 60).featured.original.width === 5000) done();
    });
    connection.addEntity({ entity: entities.single[60] });
    connection.addEntity({ entity: entities.media[62] });
  });

  test('Get author inside post before entity is ready', () => {
    expect(connection.entity('post', 60).author.id).toBe(null);
    expect(connection.entity('post', 60).author.name).toBe('');
    expect(connection.entity('media', 62).author.id).toBe(null);
    expect(connection.entity('media', 62).author.name).toBe('');
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).author.id).toBe(4);
    expect(connection.entity('post', 60).author.name).toBe('');
    connection.addEntity({ entity: entities.media[62] });
    expect(connection.entity('media', 62).author.id).toBe(2);
    expect(connection.entity('media', 62).author.name).toBe('');
  });

  test('Subscribe to author fields before entity is ready', done => {
    expect(connection.entity('post', 60).author.name).toBe('');
    autorun(() => {
      if (connection.entity('post', 60).author.name === 'Alan Martin') done();
    });
    connection.addEntity({ entity: entities.single[60] });
    connection.addEntity({ entity: entities.author[4] });
  });

  test('Get meta inside post before entity is ready', () => {
    expect(connection.entity('post', 60).headMeta.title).toBe('');
    expect(connection.entity('category', 3).headMeta.title).toBe('');
    expect(connection.entity('media', 62).headMeta.title).toBe('');
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).headMeta.title).toBe(
      convert(entities.single[60]).headMeta.title,
    );
    connection.addEntity({ entity: entities.taxonomy[3] });
    expect(connection.entity('category', 3).headMeta.title).toBe(
      convert(entities.taxonomy[3]).headMeta.title,
    );
    connection.addEntity({ entity: entities.media[62] });
    expect(connection.entity('media', 62).headMeta.title).toBe('iceland - Demo Worona');
  });

  test('Subscribe to meta fields before entity is ready', done => {
    expect(connection.entity('post', 60).headMeta.title).toBe('');
    autorun(() => {
      if (connection.entity('post', 60).headMeta.title === 'The Beauties of Gullfoss - Demo Worona')
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to media original before entity is ready', done => {
    expect(connection.entity('media', 62).original.height).toBe(null);
    autorun(() => {
      if (connection.entity('media', 62).original.height === 3025) done();
    });
    connection.addEntity({ entity: entities.media[62] });
  });

  test('Subscribe to media sizes before entity is ready', done => {
    expect(connection.entity('media', 62).sizes.length).toBe(0);
    autorun(() => {
      if (connection.entity('media', 62).sizes.length === 6) done();
    });
    connection.addEntity({ entity: entities.media[62] });
  });

  test('Subscribe to taxonomy fields before entity is ready', done => {
    expect(connection.entity('category', 3).name).toBe('');
    autorun(() => {
      if (connection.entity('category', 3).name === 'Photography') done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Subscribe to author fields before entity is ready', done => {
    expect(connection.entity('author', 4).avatar).toBe('');
    autorun(() => {
      if (
        connection.entity('author', 4).avatar ===
        'https://secure.gravatar.com/avatar/eebc7d67bdc645559fd6634e0335a42b'
      )
        done();
    });
    connection.addEntity({ entity: entities.author[4] });
  });

  test('Get missing media (featured) inside ready post', () => {
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).featured.id).toBe(62);
    expect(connection.entity('media', 62).ready).toBe(false);
    expect(connection.entity('media', 62).sizes).toEqual(observable([]));
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    expect(connection.entity('post', 60).featured.sizes).toEqual(observable([]));
  });

  test('Get parent page', done => {
    expect(connection.entity('page', 184).parent).toBe(null);
    const { entities: entitiesFromPage184 } = normalize(page184, entity);
    connection.addEntity({ entity: entitiesFromPage184.single[184] });
    expect(connection.entity('page', 184).parent.id).toBe(211);
    expect(connection.entity('page', 184).parent.title).toBe('');
    autorun(() => {
      if (connection.entity('page', 184).parent.title === 'Audio TEST') done();
    });
    const { entities: entitiesFromPage211 } = normalize(page211, entity);
    connection.addEntity({ entity: entitiesFromPage211.single[211] });
    expect(connection.entity('page', 184).parent.id).toBe(211);
    expect(connection.entity('page', 184).parent.title).toBe('Audio TEST');
  });

  test('Get latest taxonomy', () => {
    expect(connection.entity('latest', 'post').ready).toBe(false);
    expect(connection.entity('latest', 'post').link).toBe('/');
    connection.addEntity({ entity: entities.taxonomy.post });
    expect(connection.entity('latest', 'post').ready).toBe(true);
    expect(connection.entity('latest', 'post').link).toBe('https://demo.worona.org');
    expect(connection.entity('latest', 'post').pagedLink(1)).toBe('https://demo.worona.org');
    expect(connection.entity('latest', 'post').pagedLink(2)).toBe('https://demo.worona.org/page/2');
  });
});
