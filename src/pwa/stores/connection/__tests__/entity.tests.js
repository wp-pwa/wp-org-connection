/* eslint-disable no-restricted-syntax */
import { autorun } from 'mobx';
import { types, unprotect } from 'mobx-state-tree';
import { normalize } from 'normalizr';
import * as connect from '../';
import post60 from '../../../__tests__/post-60.json';
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

describe('Store › Entity', () => {
  test('Get entity shape when entity is not ready', () => {
    expect(connection.entity('someType', 'someId')).toMatchSnapshot();
  });

  test('Get single shape when entity is not ready', () => {
    expect(connection.entity('post', 60).ready).toBe(false);
    expect(connection.entity('post', 60).fetching).toBe(false);
    expect(connection.entity('post', 60).title).toBe('');
    expect(connection.entity('post', 60).link).toBe('/?p=60');
    expect(() => connection.entity('post', 60).pagedLink(3)).toThrow();
    expect(connection.entity('post', 60).taxonomy('category')).toEqual([]);
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    expect(connection.entity('post', 60).featured.sizes).toEqual([]);
    expect(connection.entity('post', 60).author.name).toBe('');
  });

  test('Get taxonomy shape when entity is not ready', () => {
    expect(connection.entity('category', 3).ready).toBe(false);
    expect(connection.entity('category', 3).name).toBe('');
    expect(connection.entity('category', 3).link).toBe('/?cat=3');
    expect(connection.entity('category', 3).pagedLink(3)).toBe('/?cat=3&paged=3');
  });

  test('Get taxonomy shape when entity is not ready', () => {
    expect(connection.entity('tag', 10).ready).toBe(false);
    expect(connection.entity('tag', 10).name).toBe('');
    expect(connection.entity('tag', 10).link).toBe('/?tag_ID=10');
    expect(connection.entity('tag', 10).pagedLink(3)).toBe('/?tag_ID=10&paged=3');
  });

  test('Get author shape when entity is not ready', () => {
    expect(connection.entity('author', 4).ready).toBe(false);
    expect(connection.entity('author', 4).name).toBe('');
    expect(connection.entity('author', 4).avatar).toBe('');
    expect(connection.entity('author', 4).link).toBe('/?author=4');
    expect(connection.entity('author', 4).pagedLink(2)).toBe('/?author=4&paged=2');
  });

  test('Get media shape when entity is not ready', () => {
    expect(connection.entity('media', 62).ready).toBe(false);
    expect(connection.entity('media', 62).link).toBe('/?attachement_id=62');
    expect(() => connection.entity('media', 62).pagedLink(2)).toThrow();
    expect(connection.entity('media', 62).author.name).toBe('');
    expect(connection.entity('media', 62).original.height).toBe(null);
    expect(connection.entity('media', 62).sizes).toEqual([]);
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
      if (connection.entity('post', 60).link === convert(entities.single[60]).link) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to paged link before entity is ready', done => {
    expect(connection.entity('category', 3).pagedLink(2)).toBe('/?cat=3&paged=2');
    autorun(() => {
      if (
        connection.entity('category', 3).pagedLink(2) ===
        `${convert(entities.taxonomy[3]).link}page/2`
      )
        done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Subscribe to single fields before entity is ready', done => {
    expect(connection.entity('post', 60).title).toBe('');
    autorun(() => {
      if (connection.entity('post', 60).title === convert(entities.single[60]).title) done();
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
    autorun(() => {
      if (connection.entity('post', 60).taxonomy('category').length === 2) done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to taxonomies array fields before entity is ready', done => {
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).taxonomy('category').length).toBe(2);
    expect(connection.entity('post', 60).taxonomy('category')[0].id).toBe(3);
    autorun(() => {
      if (
        connection.entity('post', 60).taxonomy('category')[0].name ===
        convert(entities.taxonomy[3]).name
      )
        done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Get featured inside post before entity is ready', () => {
    expect(connection.entity('post', 60).featured.id).toBe(null);
    expect(connection.entity('post', 60).featured.sizes).toEqual([]);
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).featured.id).toBe(62);
    expect(connection.entity('post', 60).featured.title).toBe('');
  });

  test('Subscribe to featured fields before entity is ready', done => {
    autorun(() => {
      if (
        connection.entity('post', 60).featured.original.width ===
        convert(entities.media[62]).original.width
      )
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

  test('Subscribe to author fields before entity is ready', done => {
    autorun(() => {
      if (connection.entity('post', 60).author.name === convert(entities.author[4]).name) done();
    });
    connection.addEntity({ entity: entities.single[60] });
    connection.addEntity({ entity: entities.author[4] });
  });

  test('Get meta inside post before entity is ready', () => {
    expect(connection.entity('post', 60).meta.title).toBe('');
    expect(connection.entity('category', 3).meta.title).toBe('');
    expect(connection.entity('media', 62).meta.title).toBe('');
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).meta.title).toBe(convert(entities.single[60]).meta.title);
    connection.addEntity({ entity: entities.taxonomy[3] });
    expect(connection.entity('category', 3).meta.title).toBe(
      convert(entities.taxonomy[3]).meta.title
    );
    connection.addEntity({ entity: entities.media[62] });
    expect(connection.entity('media', 62).meta.title).toBe('iceland');
  });

  test('Subscribe to meta fields before entity is ready', done => {
    autorun(() => {
      if (connection.entity('post', 60).meta.title === convert(entities.single[60]).meta.title)
        done();
    });
    connection.addEntity({ entity: entities.single[60] });
  });

  test('Subscribe to media original before entity is ready', done => {
    autorun(() => {
      if (
        connection.entity('media', 62).original.height ===
        convert(entities.media[62]).original.height
      )
        done();
    });
    connection.addEntity({ entity: entities.media[62] });
  });

  test('Subscribe to media sizes before entity is ready', done => {
    autorun(() => {
      if (connection.entity('media', 62).sizes.length === 6) done();
    });
    connection.addEntity({ entity: entities.media[62] });
  });

  test('Subscribe to taxonomy fields before entity is ready', done => {
    autorun(() => {
      if (connection.entity('category', 3).name === convert(entities.taxonomy[3]).name) done();
    });
    connection.addEntity({ entity: entities.taxonomy[3] });
  });

  test('Subscribe to author fields before entity is ready', done => {
    autorun(() => {
      if (connection.entity('author', 4).avatar === convert(entities.author[4]).avatar) done();
    });
    connection.addEntity({ entity: entities.author[4] });
  });

  test('Get missing media (featured) inside ready post', () => {
    connection.addEntity({ entity: entities.single[60] });
    expect(connection.entity('post', 60).featured.id).toBe(62);
    expect(connection.entity('media', 62).ready).toBe(false);
    expect(connection.entity('media', 62).sizes).toEqual([]);
    expect(connection.entity('post', 60).featured.ready).toBe(false);
    expect(connection.entity('post', 60).featured.sizes).toEqual([]);
  });
});
