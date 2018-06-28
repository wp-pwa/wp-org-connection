/* eslint-disable no-use-before-define */
import { observable } from 'mobx';
import { types, resolveIdentifier } from 'mobx-state-tree';
import { decode } from 'he';
import { join, extract } from './utils';
import entityShape, {
  link,
  pagedLink,
  mediaShape,
  authorShape,
  headMetaShape,
  originalShape,
} from './entity-shape';

const common = self => ({
  get isReady() {
    return !!self.raw;
  },
  get link() {
    if (self.raw && self.raw.link) return self.raw.link;
    const { type, id } = extract(self.mstId);
    return link(type, id);
  },
  pagedLink: (page = 1) => {
    const { type, id } = extract(self.mstId);
    return pagedLink({
      type,
      id,
      page,
      entityLink: self.raw && self.raw.link,
    });
  },
});

const single = self => ({
  get title() {
    return self.isReady ? self.raw.title.rendered : '';
  },
  get creationDate() {
    return self.isReady
      ? new Date(`${self.raw.date_gmt || self.raw.date}+00:00`).getTime()
      : null;
  },
  get modificationDate() {
    return self.isReady
      ? new Date(`${self.raw.modified_gmt}+00:00`).getTime()
      : null;
  },
  get slug() {
    return self.isReady ? self.raw.slug : '';
  },
  get content() {
    return self.isReady ? self.raw.content.rendered : '';
  },
  get excerpt() {
    return self.isReady ? self.raw.excerpt && self.raw.excerpt.rendered : '';
  },
  get target() {
    return self.isReady ? self.raw['post-target'] : '';
  },
  get parent() {
    return self.isReady && self.raw.parent
      ? resolveIdentifier(Entity, self, join(self.type, self.raw.parent)) ||
          entityShape(self.type, self.raw.parent)
      : null;
  },
  taxonomy(type) {
    return self.isReady &&
      self.raw.taxonomiesMap &&
      self.raw.taxonomiesMap[type]
      ? observable(
          self.raw.taxonomiesMap[type].map(
            id =>
              resolveIdentifier(Entity, self, join(type, id)) ||
              entityShape(type, id),
          ),
        )
      : observable([]);
  },
  get media() {
    return {
      featured:
        (self.isReady &&
          self.raw.media.featured_media &&
          resolveIdentifier(
            Entity,
            self,
            join('media', self.raw.media.featured_media),
          )) ||
        mediaShape('media', self.isReady && self.raw.media.featured_media),
      content: self.isReady ? self.raw.media.content_media : observable([]),
    };
  },
  get meta() {
    return self.isReady ? self.raw.meta : '';
  },
  get hasFeaturedMedia() {
    return self.isReady && self.raw.media.featured_media !== null;
  },
  get author() {
    return (
      (self.isReady &&
        self.raw.author &&
        resolveIdentifier(Entity, self, join('author', self.raw.author))) ||
      authorShape('author', self.isReady && self.raw.author)
    );
  },
  get headMeta() {
    return self.isReady
      ? {
          title: decode(
            (self.raw.yoast_meta && self.raw.yoast_meta.title) ||
              self.raw.name ||
              self.raw.title.rendered,
          ),
        }
      : headMetaShape;
  },
});

const taxonomy = self => ({
  get name() {
    return self.isReady ? self.raw.name : '';
  },
});

const media = self => ({
  get caption() {
    return self.isReady ? self.raw.caption : '';
  },
  get description() {
    return self.isReady ? self.raw.description : '';
  },
  get alt() {
    return self.isReady ? self.raw.alt : '';
  },
  get mimeType() {
    return self.isReady ? self.raw.mimeType : '';
  },
  get mediaType() {
    return self.isReady ? self.raw.mediaType : '';
  },
  get original() {
    if (self.isReady) {
      const { width, height, filename, url } = self.raw.original;

      if (width && height && filename && url) return self.raw.original;

      if (self.raw.sizes)
        return self.raw.sizes.reduce((current, final) => {
          if (current.width > final.width) return current;
          return final;
        });
    }

    return originalShape;
  },
  get sizes() {
    return self.isReady && self.raw.sizes ? self.raw.sizes : observable([]);
  },
});

const author = self => ({
  get name() {
    return self.isReady ? self.raw.name : '';
  },
  get slug() {
    return self.isReady ? self.raw.slug : '';
  },
  get description() {
    return self.isReady ? self.raw.description : '';
  },
  get avatar() {
    return self.isReady
      ? self.raw.avatar_urls &&
          Object.values(self.raw.avatar_urls)[0].replace(/\?.*$/, '')
      : '';
  },
});

const Entity = types
  .model('Entity')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    type: types.string,
    id: types.union(types.number, types.string),
    isFetching: false,
    hasFailed: false,
    raw: types.frozen,
  })
  .views(common)
  .views(single)
  .views(taxonomy)
  .views(media)
  .views(author);

export default Entity;
