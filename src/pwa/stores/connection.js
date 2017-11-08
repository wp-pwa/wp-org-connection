/* eslint-disable no-use-before-define */
import { types } from 'mobx-state-tree';

const Image = types.model('Image').props({
  height: types.number,
  width: types.number,
  filename: types.string,
  url: types.string,
});

const Media = types.model('Media').props({
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

const Author = types.model('Author').props({
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  description: types.string,
  link: types.string,
  avatar: types.maybe(types.union(Media, types.string)),
});

const Taxonomy = types.model('Taxonomy').props({
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  link: types.string,
  type: types.string,
});

const Meta = types.model('Meta').props({
  description: types.maybe(types.string),
  canonical: types.maybe(types.string),
});

const Single = types.model('Single').props({
  id: types.identifier(types.number),
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

const Any = types.union(Single, Taxonomy, Author, Media);

const SingleView = types
  .model('SingleView')
  .props({
    data: types.optional(types.map(types.map(Any)), {}),
  })
  .views(self => ({
    get(type, id) {
      if (typeof id === 'undefined') {
        return self.data.get(type);
      }
      return self.data.get(type).get(id);
    },
  }));

const ListView = types
  .model('ListView')
  .props({
    data: types.optional(types.map(types.map(types.array(types.array(types.reference(Any))))), {}),
  })
  .views(self => ({
    get(type, id) {
      if (typeof id === 'undefined') {
        return self.data.get(type);
      }
      return self.data.get(type).get(id);
    },
  }));

const Connection = types.model('Connection').props({
  single: types.optional(SingleView, {}),
  list: types.optional(ListView, {}),
});

export default Connection;
