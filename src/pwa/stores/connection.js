/* eslint-disable no-use-before-define */
import { types } from 'mobx-state-tree';

export const Id = types.union(types.number, types.string);

export const Image = types.model('Image').props({
  height: types.number,
  width: types.number,
  filename: types.string,
  sourceUrl: types.string,
});

export const Media = types.model('Media').props({
  id: Id,
  creationDate: types.Date,
  slug: types.string,
  alt: types.string,
  mimeType: types.string,
  title: types.string,
  author: types.reference(Author),
  original: Image,
  sizes: types.array(Image),
});

export const Author = types.model('Author').props({
  id: Id,
  name: types.string,
  slug: types.string,
  description: types.string,
  link: types.string,
  avatar: types.maybe(types.union(Media, types.string)),
});

export const Taxonomy = types.model('Taxonomy').props({
  id: Id,
  title: types.string,
  slug: types.string,
  type: types.string,
  link: types.string,
});

export const Meta = types.model('Meta').props({
  description: types.maybe(types.string),
  canonical: types.maybe(types.string),
})

export const Single = types.model('Post').props({
  id: Id,
  creationDate: types.Date,
  modificationDate: types.Date,
  title: types.string,
  slug: types.string,
  type: types.string,
  link: types.string,
  content: types.string,
  excerpt: types.string,
  author: types.reference(Author),
  featured: types.maybe(Media),
  taxonomies: types.map(types.array(types.reference(Taxonomy))),
  meta: types.maybe(Meta),
});

export const Connection = types.model('Connection').props({
  entities: types.map(
    types.union(types.map(Single), types.map(Taxonomy), types.map(Author), types.map(Media)),
  ),
});
