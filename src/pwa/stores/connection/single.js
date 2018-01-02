/* eslint-disable no-use-before-define */
import { types } from 'mobx-state-tree';
import Link from './link';

export const Image = types.model('Image').props({
  height: types.number,
  width: types.number,
  filename: types.string,
  url: types.string,
});

export const Media = types.model('Media').props({
  id: types.identifier(types.number),
  creationDate: types.maybe(types.Date),
  slug: types.maybe(types.string),
  alt: types.maybe(types.string),
  mimeType: types.maybe(types.string),
  mediaType: types.maybe(types.string),
  title: types.maybe(types.string),
  author: types.maybe(types.reference(types.late(() => Author))),
  original: types.maybe(Image),
  sizes: types.maybe(types.array(Image)),
});

export const Author = types.model('Author').props({
  id: types.identifier(types.number),
  name: types.string,
  slug: types.string,
  description: types.string,
  link: types.optional(Link, {}),
  _link: types.maybe(types.string),
  avatar: types.maybe(types.union(Media, types.string)),
});

export const Meta = types.model('Meta').props({
  title: types.maybe(types.string),
  description: types.maybe(types.string),
  canonical: types.maybe(types.string),
  pretty: false,
});

export const Taxonomy = types.model('Taxonomy').props({
  id: types.identifier(types.number),
  name: types.maybe(types.string),
  slug: types.maybe(types.string),
  link: types.optional(Link, {}),
  _link: types.maybe(types.string),
  taxonomy: types.string,
  target: types.maybe(types.string),
  meta: types.optional(Meta, {}),
});

export const Post = types
  .model('Post')
  .props({
    id: types.identifier(types.number),
    fetching: types.optional(types.boolean, false),
    ready: types.optional(types.boolean, false),
    type: types.string,
    creationDate: types.maybe(types.Date),
    modificationDate: types.maybe(types.Date),
    title: types.maybe(types.string),
    slug: types.maybe(types.string),
    link: types.optional(Link, {}),
    _link: types.maybe(types.string),
    guid: types.maybe(types.string),
    content: types.maybe(types.string),
    excerpt: types.maybe(types.string),
    author: types.maybe(types.reference(Author)),
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

const PostRef = types.model({ type: 'post', entity: types.reference(Post) });
const TaxonomyRef = types.model({ type: 'taxonomy', entity: types.reference(Taxonomy) });
const AuthorRef = types.model({ type: 'author', entity: types.reference(Author) });
const MediaRef = types.model({ type: 'media', entity: types.reference(Media) });

const references = { post: PostRef, taxonomy: TaxonomyRef, author: AuthorRef, media: MediaRef };

const AnyRef = types.union(
  snapshot => snapshot && snapshot.mst && references[snapshot.mst],
  PostRef,
  TaxonomyRef,
  AuthorRef,
  MediaRef,
);

export const Single = types
  .model('Single')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    type: types.string, // post, category, movie, author, media
    id: types.number, // 60, 7, 34, 3, 35
    ready: false,
    fetching: false,
    reference: types.maybe(types.reference(AnyRef)), // Post, Taxonomy, Author, Media
  })
  .views(self => ({
    get entity() {
      return self.reference && self.reference.entity || {};
    },
    get title() {
      return (self.entity && self.entity.title) || null;
    },
    // [...] All other properties from Post, Taxonomy, Author and Media
  }));

export const Any = types.union(
  snapshot => {
    if (snapshot.taxonomy) return Taxonomy;
    if (snapshot.name) return Author;
    if (snapshot.original || (snapshot.type === 'media' && snapshot.error)) return Media;
    return Post;
  },
  Post,
  Taxonomy,
  Author,
  Media,
);
