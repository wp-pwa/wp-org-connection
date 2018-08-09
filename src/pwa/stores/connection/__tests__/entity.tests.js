/* eslint-disable no-restricted-syntax */
import { autorun, observable } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import post60 from '../../../__tests__/post-60.json';
import page184 from '../../../__tests__/page-with-subpage.json';
import page211 from '../../../__tests__/page-211.json';
import media581 from '../../../__tests__/media-581.json';
import { entity } from '../../../schemas';

const { entities } = normalize(post60, entity);
const { entities: entitiesFromMedia581 } = normalize(media581, entity);

const Connection = types
  .model()
  .props(connect.props)
  .views(connect.views)
  .actions(connect.actions);

const Stores = types.model().props({
  connection: types.optional(Connection, {}),
});

let stores = null;
let connection = null;
beforeEach(() => {
  stores = Stores.create({});
  connection = stores.connection; // eslint-disable-line
  unprotect(stores);
});

describe('Connection › Entity', () => {
  test('Get entity shape when entity is not ready', () => {
    expect(connection.entity('someType', 'someId')).toMatchSnapshot();
  });

  test('Get single shape when entity is not ready', () => {
    expect(connection.entity('post', 60).isReady).toBe(false);
    expect(connection.entity('post', 60).isFetching).toBe(false);
    expect(connection.entity('post', 60).title).toBe('');
    expect(connection.entity('post', 60).link).toBe('/?p=60');
    expect(() => connection.entity('post', 60).pagedLink(3)).toThrow();
    expect(connection.entity('post', 60).taxonomy('category')).toEqual(
      observable([]),
    );
    expect(connection.entity('post', 60).hasFeaturedMedia).toBe(false);
    expect(connection.entity('post', 60).media.featured.isReady).toBe(false);
    expect(connection.entity('post', 60).media.featured.sizes).toEqual(
      observable([]),
    );
    expect(connection.entity('post', 60).media.content).toEqual(observable([]));
    expect(connection.entity('post', 60).author.name).toBe('');
  });

  test('Get category shape when entity is not ready', () => {
    expect(connection.entity('category', 3).isReady).toBe(false);
    expect(connection.entity('category', 3).name).toBe('');
    expect(connection.entity('category', 3).link).toBe('/?cat=3');
    expect(connection.entity('category', 3).pagedLink(1)).toBe('/?cat=3');
    expect(connection.entity('category', 3).pagedLink(3)).toBe(
      '/?cat=3&paged=3',
    );
  });

  test('Get tag shape when entity is not ready', () => {
    expect(connection.entity('tag', 10).isReady).toBe(false);
    expect(connection.entity('tag', 10).name).toBe('');
    expect(connection.entity('tag', 10).link).toBe('/?tag_ID=10');
    expect(connection.entity('tag', 10).pagedLink(1)).toBe('/?tag_ID=10');
    expect(connection.entity('tag', 10).pagedLink(3)).toBe(
      '/?tag_ID=10&paged=3',
    );
  });

  test('Get author shape when entity is not ready', () => {
    expect(connection.entity('author', 4).isReady).toBe(false);
    expect(connection.entity('author', 4).name).toBe('');
    expect(connection.entity('author', 4).avatar).toBe('');
    expect(connection.entity('author', 4).link).toBe('/?author=4');
    expect(connection.entity('author', 4).pagedLink(1)).toBe('/?author=4');
    expect(connection.entity('author', 4).pagedLink(2)).toBe(
      '/?author=4&paged=2',
    );
  });

  test('Get latest post taxonomy shape when entity is not ready', () => {
    expect(connection.entity('latest', 'post').isReady).toBe(false);
    expect(connection.entity('latest', 'post').name).toBe('');
    expect(connection.entity('latest', 'post').link).toBe('/');
    expect(connection.entity('latest', 'post').pagedLink(1)).toBe('/');
    expect(connection.entity('latest', 'post').pagedLink(3)).toBe('/page/3/');
  });

  test('Get latest movie taxonomy shape when entity is not ready', () => {
    expect(connection.entity('latest', 'movie').isReady).toBe(false);
    expect(connection.entity('latest', 'movie').name).toBe('');
    expect(connection.entity('latest', 'movie').link).toBe('/');
    expect(connection.entity('latest', 'movie').pagedLink(1)).toBe('/');
    expect(connection.entity('latest', 'movie').pagedLink(3)).toBe('/page/3/');
  });

  test("Get media shape when entity is not ready and entity hasn't been created", () => {
    expect(connection.entity('media', 62).isReady).toBe(false);
    expect(connection.entity('media', 62).link).toBe('/?attachement_id=62');
    expect(() => connection.entity('media', 62).pagedLink(2)).toThrow();
    expect(connection.entity('media', 62).author.name).toBe('');
    expect(connection.entity('media', 62).original.height).toBe(null);
    expect(connection.entity('media', 62).sizes).toEqual(observable([]));
  });

  test('Get media shape when entity is not ready and entity has been created', () => {
    connection.getEntity({ type: 'media', id: 62 });
    expect(connection.entity('media', 62).isReady).toBe(false);
    expect(connection.entity('media', 62).link).toBe('/?attachement_id=62');
    expect(() => connection.entity('media', 62).pagedLink(2)).toThrow();
    expect(connection.entity('media', 62).author.name).toBe('');
    expect(connection.entity('media', 62).original.height).toBe(null);
    expect(connection.entity('media', 62).sizes).toEqual(observable([]));
  });

  test('Media original should be biggest size if any parameter is not present', () => {
    connection.addEntity({ entity: entitiesFromMedia581.media[581] });
    expect(connection.entity('media', 581).isReady).toBe(true);
    expect(connection.entity('media', 581).original.width).toBe(290);
  });

  test("Don't add an entity if it doesn't have type or id", () => {
    expect(connection.entity('media', 42).isReady).toBe(false);
    connection.addEntity({ entity: { type: 'media' } });
    connection.addEntity({ entity: { id: 42 } });
  });

  test('Subscribe to ready before entity is ready', done => {
    expect(connection.entity('post', 60).isReady).toBe(false);
    autorun(() => {
      if (connection.entity('post', 60).isReady) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to link before entity is ready', done => {
    expect(connection.entity('post', 60).link).toBe('/?p=60');
    autorun(() => {
      if (
        connection.entity('post', 60).link ===
        'https://demo.worona.org/the-beauties-of-gullfoss/'
      )
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test("Don't invalidate headMeta when item is added twice", () => {
    let itemChanged = 1;
    connection.addEntity({ entity: entities.single[60] });
    autorun(() => {
      connection.entity('post', 60).headMeta.title; // eslint-disable-line
      itemChanged += 1;
    });
    connection.addEntity({ entity: entities.single[60] });
    expect(itemChanged).toBe(2);
  });

  test('Subscribe to paged link before entity is ready', done => {
    expect(connection.entity('category', 3).pagedLink(2)).toBe(
      '/?cat=3&paged=2',
    );
    autorun(() => {
      if (
        connection.entity('category', 3).pagedLink(2) ===
          'https://demo.worona.org/wp-cat/photography/page/2/' &&
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
      if (connection.entity('post', 60).title === 'The Beauties of Gullfoss')
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Fetching should be false after item is added', () => {
    expect(connection.entity('post', 60).isFetching).toBe(false);
    connection.fetchingEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isFetching).toBe(true);
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).isFetching).toBe(false);
  });

  test('Subscribe to fetching from false to true', done => {
    expect(connection.entity('post', 60).isFetching).toBe(false);
    autorun(() => {
      if (connection.entity('post', 60).isFetching) done();
    });
    connection.fetchingEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isReady).toBe(false);
  });

  test('Subscribe to fetching from true to false', done => {
    connection.fetchingEntity({ type: 'post', id: 60 });
    expect(connection.entity('post', 60).isFetching).toBe(true);
    autorun(() => {
      if (!connection.entity('post', 60).isFetching) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Shape should be the same after fetching is started', () => {
    const authorId1 = connection.entity('post', 60).author.id;
    connection.fetchingEntity({ type: 'post', id: 60 });
    const authorId2 = connection.entity('post', 60).author.id;
    expect(authorId1).toEqual(authorId2);
    const featuredOriginal1 = connection.entity('post', 60).media.featured
      .original.url;
    connection.fetchingEntity({ type: 'post', id: 60 });
    const featuredOriginal2 = connection.entity('post', 60).media.featured
      .original.url;
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
    expect(connection.entity('post', 60).taxonomy('category')).toHaveLength(0);
    expect(connection.entity('post', 60).taxonomy('tag')).toHaveLength(0);
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).taxonomy('category')).toHaveLength(2);
    expect(connection.entity('post', 60).taxonomy('category')[0].id).toBe(3);
    expect(connection.entity('post', 60).taxonomy('tag')).toHaveLength(4);
    expect(connection.entity('post', 60).taxonomy('tag')[1].id).toBe(9);
  });

  test('Subscribe to taxonomies array before entity is ready', done => {
    expect(connection.entity('post', 60).taxonomy('category')).toHaveLength(0);
    autorun(() => {
      if (connection.entity('post', 60).taxonomy('category').length === 2)
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to taxonomies array fields before entity is ready', done => {
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).taxonomy('category')).toHaveLength(2);
    expect(connection.entity('post', 60).taxonomy('category')[0].id).toBe(3);
    expect(connection.entity('post', 60).taxonomy('category')[0].name).toBe('');
    autorun(() => {
      if (
        connection.entity('post', 60).taxonomy('category')[0].name ===
        'Photography'
      )
        done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Get featured inside post before entity is ready', () => {
    expect(connection.entity('post', 60).media.featured.id).toBe(null);
    expect(connection.entity('post', 60).media.featured.sizes).toEqual(
      observable([]),
    );
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).media.featured.id).toBe(62);
    expect(connection.entity('post', 60).media.featured.title).toBe('');
    expect(connection.entity('post', 60).hasFeaturedMedia).toBe(true);
  });

  test('Subscribe to hasFeaturedMedia field before entity is ready', done => {
    expect(connection.entity('post', 60).hasFeaturedMedia).toBe(false);
    autorun(() => {
      if (connection.entity('post', 60).hasFeaturedMedia === true) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to featured fields before entity is ready', done => {
    expect(connection.entity('post', 60).media.featured.original.width).toBe(
      null,
    );
    autorun(() => {
      if (connection.entity('post', 60).media.featured.original.width === 5000)
        done();
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

  test('Get meta inside post before entity is ready', () => {
    expect(connection.entity('post', 60).headMeta.title).toBe('');
    expect(connection.entity('category', 3).headMeta.title).toBe('');
    expect(connection.entity('media', 62).headMeta.title).toBe('');
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).headMeta.title).toBe(
      'The Beauties of Gullfoss - Demo Worona',
    );
    connection.addEntity({ entity: entities.taxonomy[3] });
    expect(connection.entity('category', 3).headMeta.title).toBe(
      'Photography Archives - Demo Worona',
    );
    connection.addEntity({ entity: entities.media[62] });
    expect(connection.entity('media', 62).headMeta.title).toBe(
      'iceland - Demo Worona',
    );
  });

  test('Subscribe to meta fields before entity is ready', done => {
    expect(connection.entity('post', 60).headMeta.title).toBe('');
    autorun(() => {
      if (
        connection.entity('post', 60).headMeta.title ===
        'The Beauties of Gullfoss - Demo Worona'
      )
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
    expect(connection.entity('media', 62).sizes).toHaveLength(0);
    autorun(() => {
      if (connection.entity('media', 62).sizes.length === 6) done();
    });
    connection.addEntity({ entity: entities.media[62] });
  });

  test('Subscribe to media content on post before entity is ready', done => {
    expect(connection.entity('post', 60).media.content).toHaveLength(0);
    autorun(() => {
      if (connection.entity('post', 60).media.content.length === 6) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to taxonomy fields before entity is ready', done => {
    expect(connection.entity('category', 3).name).toBe('');
    autorun(() => {
      if (connection.entity('category', 3).name === 'Photography') done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Subscribe to author fields inside post before entity is ready', done => {
    expect(connection.entity('post', 60).author.name).toBe('');
    autorun(() => {
      if (connection.entity('post', 60).author.name === 'Alan Martin') done();
    });
    connection.addEntity({ entity: entities.single[60] });
    connection.addEntity({ entity: entities.author[4] });
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
    expect(connection.entity('post', 60).media.featured.id).toBe(62);
    expect(connection.entity('media', 62).isReady).toBe(false);
    expect(connection.entity('media', 62).sizes).toEqual(observable([]));
    expect(connection.entity('post', 60).media.featured.isReady).toBe(false);
    expect(connection.entity('post', 60).media.featured.sizes).toEqual(
      observable([]),
    );
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
    expect(connection.entity('latest', 'post').isReady).toBe(false);
    expect(connection.entity('latest', 'post').link).toBe('/');
    connection.addEntity({ entity: entities.taxonomy.post });
    expect(connection.entity('latest', 'post').isReady).toBe(true);
    expect(connection.entity('latest', 'post').link).toBe(
      'https://demo.worona.org',
    );
    expect(connection.entity('latest', 'post').pagedLink(1)).toBe(
      'https://demo.worona.org',
    );
    expect(connection.entity('latest', 'post').pagedLink(2)).toBe(
      'https://demo.worona.org/page/2/',
    );
  });

  test('Subscribe to meta object before entity is ready', done => {
    expect(connection.entity('post', 60).meta).toEqual({});
    autorun(() => {
      if (connection.entity('post', 60).meta.custom_field === 'test value')
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Get stuff from raw api response', done => {
    expect(connection.entity('post', 60).raw).toEqual({});
    autorun(() => {
      if (connection.entity('post', 60).raw.sticky === false) done();
    });
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).raw.sticky).toEqual(false);
  });

  test('Get src with and without cdn from media', () => {
    connection.addEntity({ entity: entitiesFromMedia581.media[581] });

    Object.defineProperty(stores, 'settings', {
      writable: true,
      value: {
        connection: {},
      },
    });

    expect(connection.entity('media', 581).src).toBe(
      'https://viviendosanos.com/wp-content/uploads/2007/08/amorreal2-290x185.jpg',
    );

    Object.defineProperty(stores.settings.connection, 'cdn', {
      writable: true,
      value: {},
    });

    expect(connection.entity('media', 581).src).toBe(
      'https://viviendosanos.com/wp-content/uploads/2007/08/amorreal2-290x185.jpg',
    );

    Object.defineProperty(stores.settings.connection.cdn, 'media', {
      writable: true,
      value: 'https://cdn.frontity.media',
    });

    expect(connection.entity('media', 581).src).toBe(
      'https://cdn.frontity.media/wp-content/uploads/2007/08/amorreal2-290x185.jpg',
    );
  });

  test('Get srcSet with and without cdn from media', () => {
    connection.addEntity({ entity: entitiesFromMedia581.media[581] });

    Object.defineProperty(stores, 'settings', {
      writable: true,
      value: {
        connection: {},
      },
    });

    expect(connection.entity('media', 581).srcSet).toBe(
      'https://viviendosanos.com/wp-content/uploads/2007/08/amorreal2-290x185.jpg 290w',
    );

    Object.defineProperty(stores.settings.connection, 'cdn', {
      writable: true,
      value: {},
    });

    expect(connection.entity('media', 581).srcSet).toBe(
      'https://viviendosanos.com/wp-content/uploads/2007/08/amorreal2-290x185.jpg 290w',
    );

    Object.defineProperty(stores.settings.connection.cdn, 'media', {
      writable: true,
      value: 'https://cdn.frontity.media',
    });

    expect(connection.entity('media', 581).srcSet).toBe(
      'https://cdn.frontity.media/wp-content/uploads/2007/08/amorreal2-290x185.jpg 290w',
    );
  });
});
