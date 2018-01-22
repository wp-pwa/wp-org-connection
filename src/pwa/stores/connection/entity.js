/* eslint-disable no-use-before-define */
import { types, getParent, resolveIdentifier } from 'mobx-state-tree';
import { join, extract } from './utils';
import entityShape, { link, pagedLink } from './entity-shape';

const common = self => ({
  get ready() {
    return !!self.entity;
  },
  get link() {
    if (self.entity && self.entity.link) return self.entity.link;
    const { type, id } = extract(self.mstId);
    return link(type, id);
  },
  pagedLink: (page = 1) => {
    const { type, id } = extract(self.mstId);
    return pagedLink({ type, id, page, entityLink: self.entity && self.entity.link });
  }
});

const single = self => ({
  get title() {
    return self.ready ? self.entity.title : '';
  },
  get creationDate() {
    return self.ready ? self.entity.creationDate : null;
  },
  get modificationDate() {
    return self.ready ? self.entity.modificationDate : null;
  },
  get slug() {
    return self.ready ? self.entity.slug : '';
  },
  get content() {
    return self.ready ? self.entity.content : '';
  },
  get excerpt() {
    return self.ready ? self.entity.excerpt : '';
  },
  get target() {
    return self.ready ? self.entity.target : '';
  },
  taxonomies(type) {
    return self.ready && self.entity.taxonomies && self.entity.taxonomies[type]
      ? self.entity.taxonomies[type].map(id =>
          resolveIdentifier(Entity, self, join(type, id))  || entityShape(type, id)
        )
      : [];
  }
  // featured: media,
  // author,
  // meta
});

const taxonomy = self => ({
  get name() {
    return self.ready ? self.entity.name : '';
  },
});

export const Entity = types
  .model('Entity')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    fetching: false,
    entity: types.frozen
  })
  .views(common)
  .views(single)
  .views(taxonomy);

export const Image = types.model('Image').props({
  height: types.number,
  width: types.number,
  filename: types.string,
  url: types.string
});

export const Media = types.model('Media').props({
  mst: 'media',
  id: types.identifier(types.number),
  creationDate: types.Date,
  slug: types.string,
  title: types.string,
  author: types.reference(types.late(() => Author)),
  alt: types.string,
  mimeType: types.string,
  mediaType: types.string,
  original: Image,
  sizes: types.array(Image)
});

export const Meta = types.model('Meta').props({
  title: types.maybe(types.string),
  description: types.maybe(types.string),
  canonical: types.maybe(types.string)
});

export const Author = types.model('Author').props({
  mst: 'author',
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  description: types.string,
  link: types.string,
  avatar: types.maybe(types.string)
});

export const Taxonomy = types.model('Taxonomy').props({
  mst: 'taxonomy',
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  link: types.string,
  type: types.string,
  target: types.maybe(types.string),
  meta: types.optional(Meta, {})
});

const Featured = types
  .model('Featured')
  .props({
    entity: types.maybe(
      types.reference(Media, {
        get: (identifier, parent) =>
          getParent(parent, 4)
            .entities.get('media')
            .get(identifier) || null,
        set: value => value
      })
    )
  })
  .views(self => ({
    get ready() {
      return !!self.entity;
    },
    get id() {
      return (self.entity && self.entity.id) || null;
    },
    get creationDate() {
      return (self.entity && self.entity.creationDate) || null;
    },
    get slug() {
      return (self.entity && self.entity.slug) || null;
    },
    get title() {
      return (self.entity && self.entity.title) || null;
    },
    get alt() {
      return (self.entity && self.entity.alt) || null;
    },
    get mimeType() {
      return (self.entity && self.entity.mimeType) || null;
    },
    get mediaType() {
      return (self.entity && self.entity.mediaType) || null;
    },
    get original() {
      return (self.entity && self.entity.original) || {};
    },
    get sizes() {
      return (self.entity && self.entity.sizes) || [];
    }
  }));

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
  featured: Featured,
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
          }
        })
      )
    ),
    {}
  ),
  target: types.maybe(types.string),
  meta: types.optional(Meta, {})
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
  Media
);
