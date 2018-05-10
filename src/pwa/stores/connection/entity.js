/* eslint-disable no-use-before-define */
import { observable } from 'mobx';
import { types, resolveIdentifier, flow } from 'mobx-state-tree';
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
  },
});

const single = self => ({
  get title() {
    return self.isReady ? self.entity.title : '';
  },
  get creationDate() {
    return self.isReady ? self.entity.creationDate : null;
  },
  get modificationDate() {
    return self.isReady ? self.entity.modificationDate : null;
  },
  get slug() {
    return self.isReady ? self.entity.slug : '';
  },
  get content() {
    return self.isReady ? self.entity.content : '';
  },
  get excerpt() {
    return self.isReady ? self.entity.excerpt : '';
  },
  get target() {
    return self.isReady ? self.entity.target : '';
  },
  get parent() {
    return self.isReady && self.entity.parent
      ? resolveIdentifier(Entity, self, join(self.type, self.entity.parent)) ||
          entityShape(self.type, self.entity.parent)
      : null;
  },
  taxonomy(type) {
    return self.isReady && self.entity.taxonomies && self.entity.taxonomies[type]
      ? observable(
          self.entity.taxonomies[type].map(
            id => resolveIdentifier(Entity, self, join(type, id)) || entityShape(type, id),
          ),
        )
      : observable([]);
  },
  get media() {
    return {
      featured:
        (self.isReady &&
          self.entity.media.featured &&
          resolveIdentifier(Entity, self, join('media', self.entity.media.featured))) ||
        mediaShape('media', self.isReady && self.entity.media.featured),
      content: self.isReady ? self.entity.media.content : observable([]),
    };
  },
  get hasFeaturedMedia() {
    return self.isReady && self.entity.media.featured !== null;
  },
  get author() {
    return (
      (self.isReady &&
        self.entity.author &&
        resolveIdentifier(Entity, self, join('author', self.entity.author))) ||
      authorShape('author', self.isReady && self.entity.author)
    );
  },
  get headMeta() {
    return (self.isReady && self.entity.headMeta) || headMetaShape;
  },
});

const taxonomy = self => ({
  get name() {
    return self.isReady ? self.entity.name : '';
  },
});

const media = self => ({
  get caption() {
    return self.isReady ? self.entity.caption : '';
  },
  get description() {
    return self.isReady ? self.entity.description : '';
  },
  get alt() {
    return self.isReady ? self.entity.alt : '';
  },
  get mimeType() {
    return self.isReady ? self.entity.mimeType : '';
  },
  get mediaType() {
    return self.isReady ? self.entity.mediaType : '';
  },
  get original() {
    if (self.isReady) {
      const { width, height, filename, url } = self.entity.original;

      if (width && height && filename && url) return self.entity.original;

      if (self.entity.sizes)
        return self.entity.sizes.reduce((current, final) => {
          if (current.width > final.width) return current;
          return final;
        });
    }

    return originalShape;
  },
  get sizes() {
    return self.isReady && self.entity.sizes ? self.entity.sizes : observable([]);
  },
});

const author = self => ({
  get name() {
    return self.isReady ? self.entity.name : '';
  },
  get slug() {
    return self.isReady ? self.entity.slug : '';
  },
  get description() {
    return self.isReady ? self.entity.description : '';
  },
  get avatar() {
    return self.isReady ? self.entity.avatar : '';
  },
});

const actions = self => ({
  fetch: flow(function* fetch() {
    
  }),
});

const Entity = types
  .model('Entity')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    type: types.string,
    id: types.union(types.number, types.string),
    isFetching: false,
    entity: types.frozen,
  })
  .views(common)
  .views(single)
  .views(taxonomy)
  .views(media)
  .views(author)
  .actions(actions);


export default Entity;
