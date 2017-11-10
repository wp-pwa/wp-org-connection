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
  featured: types.maybe(types.reference(Media)),
  taxonomiesMap: types.map(types.array(types.reference(Taxonomy))),
  meta: types.maybe(Meta),
}).views(self => {
  const taxonomies = {};
  return {
    get taxonomies() {
      self.taxonomiesMap.keys().forEach(taxonomy => {
        taxonomies[taxonomy] = self.taxonomiesMap.get(taxonomy);
      });
      return taxonomies;
    }
  }
});

const Any = types.union(Single, Taxonomy, Author, Media);

const Connection = types
  .model('Connection')
  .props({
    singleMap: types.optional(types.map(types.map(Any)), {}),
    listMap: types.optional(
      types.map(types.map(types.array(types.array(types.reference(Any))))),
      {},
    ),
  })
  .views(self => {
    const single = {};
    const list = {};
    return {
      get single() {
        self.singleMap.keys().forEach(type => {
          single[type] = single[type] || [];
          self.singleMap.get(type).keys().forEach(index => {
            if (!single[type][index]) single[type][index] = self.singleMap.get(type).get(index);
          });
        });
        return single;
      },
      get list() {
        const keys = self.listMap.keys();
        keys.reduce((acc, key) => {
          list[key] = self.listMap.get(key);
          return list;
        }, list);
        return list;
      },
    };
  });

export default Connection;
