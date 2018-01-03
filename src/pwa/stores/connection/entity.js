/* eslint-disable no-use-before-define */
import { types, getParent } from 'mobx-state-tree';

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
  target: types.string,
  meta: types.optional(Meta, {}),
});

export const Single = types
  .model('Single')
  .props({
    mst: 'single',
    id: types.identifier(types.number),
    type: types.string,
    fetching: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
    creationDate: types.Date,
    modificationDate: types.Date,
    title: types.string,
    slug: types.string,
    link: types.string,
    guid: types.string,
    content: types.string,
    excerpt: types.string,
    author: types.reference(Author),
    featured: types.maybe(types.reference(Media)),
    taxonomiesMap: types.optional(types.map(types.array(types.reference(Taxonomy))), {}),
    target: types.maybe(types.string),
    meta: types.optional(Meta, {}),
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

const PostRef = types.model({
  mst: 'post',
  entity: types.reference(Post, {
    get(identifier, parent) {
      return getParent(parent).getOrLoadUser(identifier);
    },
    set(value) {
      return value.name;
    },
  }),
});
const TaxonomyRef = types.model({ mst: 'taxonomy', entity: types.reference(Taxonomy) });
const AuthorRef = types.model({ mst: 'author', entity: types.reference(Author) });
const MediaRef = types.model({ mst: 'media', entity: types.reference(Media) });

const references = { post: PostRef, taxonomy: TaxonomyRef, author: AuthorRef, media: MediaRef };

const AnyRef = types.union(
  snapshot => snapshot && snapshot.mst && references[snapshot.mst],
  PostRef,
  TaxonomyRef,
  AuthorRef,
  MediaRef,
);

export const AnyEntity = types.union(
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


export const Entity = types
  .model('Entity')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    type: types.string, // post, category, movie, author, media
    id: types.number, // 60, 7, 34, 3, 35
    ready: false,
    fetching: false,
    reference: types.maybe(types.reference(Resources, )), // Post, Taxonomy, Author, Media
  })
  .views(self => ({
    get ready() {
      return getParent(self).resources.get(self.type)
    },
    get entity() {
      return (self.reference && self.reference.entity) || {};
    },
    get title() {
      return (self.entity && self.entity.title) || null;
    },
    // [...] All other properties from Post, Taxonomy, Author and Media
  }));
