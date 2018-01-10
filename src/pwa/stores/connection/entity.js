/* eslint-disable no-use-before-define */
import { types, getParent } from 'mobx-state-tree';

const parse = id => (Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : id);

export const Entity = types
  .model('Entity')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    type: types.string, // post, category, movie, author, media
    id: types.number, // 60, 7, 34, 3, 35
    fetching: false,
    entity: types.reference(types.late(() => Entities), {
      get(identifier, parent) {
        return parent.root.entities.get(parent.type).get(parent.id) || {};
      },
      set(value) {
        return value;
      },
    }),
  })
  .views(self => ({
    get root() {
      return getParent(self, 2);
    },
    get ready() {
      return !!self.root.entities.get(self.type).get(self.id);
    },
    get title() {
      return (self.entity && self.entity.title) || null;
    },
    get creationDate() {
      return (self.entity && self.entity.creationDate) || null;
    },
    get modificationDate() {
      return (self.entity && self.entity.modificationDate) || null;
    },
    get slug() {
      return (self.entity && self.entity.slug) || null;
    },
    get content() {
      return (self.entity && self.entity.content) || null;
    },
    get excerpt() {
      return (self.entity && self.entity.excerpt) || null;
    },
    get isSingle() {
      return (
        (self.entity && self.entity.mst === 'single') ||
        self.root.typeRelations.get(self.type) === 'single'
      );
    },
    get isTaxonomy() {
      return (
        (self.entity && self.entity.mst === 'taxonomy') ||
        self.root.typeRelations.get(self.type) === 'taxonomy'
      );
    },
    get link() {
      if (self.entity && self.entity.link) return self.entity.link;
      if (self.type === 'category') return `/?cat=${self.id}`;
      if (self.type === 'author') return `/?author=${self.id}`;
      if (self.type === 'media') return `/?attachement_id=${self.id}`;
      if (self.isSingle) return `/?p=${self.id}`;
      return '/';
    },
    pagedLink(page = 1) {
      if (self.isSingle) throw new Error(`Can't add a page to a single entity (${self.mstId})`);
      return self.ready ? `${self.link}/page/${page}` : `${self.link}&paged=${page}`;
    },
    get featured() {
      return (self.entity && self.entity.featured) || null;
    },
    taxonomies(taxonomy) {
      return (self.entity && self.entity.taxonomies && self.entity.taxonomies.get(taxonomy)) || [];
    },
    // Taxonomies
    get name() {
      return (self.entity && self.entity.name) || null;
    },
  }));


export const Image = types.model('Image').props({
  height: types.number,
  width: types.number,
  filename: types.string,
  url: types.string,
});

export const Media = types.model('Media').props({
  mst: 'media',
  id: types.identifier(types.number),
  creationDate: types.Date,
  slug: types.string,
  alt: types.string,
  mimeType: types.string,
  mediaType: types.string,
  title: types.string,
  author: types.reference(types.late(() => Author)),
  original: Image,
  sizes: types.array(Image),
});

export const Author = types.model('Author').props({
  mst: 'author',
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  description: types.string,
  link: types.string,
  avatar: types.maybe(types.string),
});

export const Meta = types.model('Meta').props({
  title: types.maybe(types.string),
  description: types.maybe(types.string),
  canonical: types.maybe(types.string),
});

export const Taxonomy = types.model('Taxonomy').props({
  mst: 'taxonomy',
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  link: types.string,
  type: types.string,
  target: types.maybe(types.string),
  meta: types.optional(Meta, {}),
});

export const Single = types.model('Single').props({
  mst: 'single',
  id: types.identifier(types.number),
  type: types.string,
  creationDate: types.Date,
  modificationDate: types.Date,
  title: types.string,
  slug: types.string,
  link: types.string,
  content: types.string,
  excerpt: types.string,
  author: types.reference(Author),
  featured: types.maybe(
    types.reference(Entity, {
      get(identifier, parent) {
        const [, type, id] = /(\w+)_(\d+)/.exec(identifier);
        const root = getParent(parent, 3);
        return root.entity(type, parse(id));
      },
      set(value) {
        return value;
      },
    }),
  ),
  taxonomies: types.optional(
    types.map(
      types.array(
        types.reference(Entity, {
          get(identifier, parent) {
            const [, type, id] = /(\w+)_(\d+)/.exec(identifier);
            const root = getParent(parent, 5);
            return root.entity(type, parse(id));
          },
          set(value) {
            return value;
          },
        }),
      ),
    ),
    {},
  ),
  target: types.maybe(types.string),
  meta: types.optional(Meta, {}),
});

export const Entities = types.union(
  snapshot => {
    if (snapshot.mst === 'taxonomy') return Taxonomy;
    if (snapshot.mst === 'author') return Author;
    if (snapshot.mst === 'media') return Media;
    return Single;
  },
  Single,
  Taxonomy,
  Author,
  Media,
);
