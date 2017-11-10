/* eslint-disable no-use-before-define */
import { types } from 'mobx-state-tree';

export const Image = types.model('Image').props({
  height: types.number,
  width: types.number,
  filename: types.string,
  url: types.string,
});

export const Media = types.model('Media').props({
  id: types.identifier(types.number),
  creationDate: types.Date,
  slug: types.string,
  alt: types.string,
  mimeType: types.string,
  title: types.string,
  author: types.reference(types.late(() => Author)),
  original: Image,
  sizes: types.array(Image),
});

export const Author = types.model('Author').props({
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  description: types.string,
  link: types.string,
  avatar: types.maybe(types.union(Media, types.string)),
});

export const Taxonomy = types.model('Taxonomy').props({
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  link: types.string,
  type: types.string,
});

export const Meta = types.model('Meta').props({
  description: types.maybe(types.string),
  canonical: types.maybe(types.string),
});

export const Single = types
  .model('Single')
  .props({
    id: types.identifier(types.number),
    creationDate: types.Date,
    modificationDate: types.Date,
    title: types.string,
    slug: types.string,
    type: types.string,
    link: types.string,
    content: types.string,
    excerpt: types.maybe(types.string),
    author: types.reference(Author),
    featured: types.maybe(types.reference(Media)),
    taxonomiesMap: types.optional(types.map(types.array(types.reference(Taxonomy))), {}),
    meta: types.maybe(Meta),
  })
  .views(self => {
    const taxonomies = {};
    return {
      get taxonomies() {
        self.taxonomiesMap.keys().forEach(taxonomy => {
          taxonomies[taxonomy] = self.taxonomiesMap.get(taxonomy);
        });
        return taxonomies;
      },
    };
  });

export const Any = types.union(Single, Taxonomy, Author, Media);
