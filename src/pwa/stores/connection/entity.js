/* eslint-disable no-use-before-define */
import { types, resolveIdentifier } from 'mobx-state-tree';
import { join, extract } from './utils';
import entityShape, {
  link,
  pagedLink,
  mediaShape,
  authorShape,
  metaShape,
  originalShape,
} from './entity-shape';

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
  },
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
  get parent() {
    return self.ready && self.entity.parent
      ? resolveIdentifier(Entity, self, join(self.type, self.entity.parent)) ||
          entityShape(self.type, self.entity.parent)
      : null;
  },
  taxonomy(type) {
    return self.ready && self.entity.taxonomies && self.entity.taxonomies[type]
      ? self.entity.taxonomies[type].map(
          id => resolveIdentifier(Entity, self, join(type, id)) || entityShape(type, id),
        )
      : [];
  },
  get featured() {
    return (
      (self.ready &&
        self.entity.featured &&
        resolveIdentifier(Entity, self, join('media', self.entity.featured))) ||
      mediaShape('media', self.ready && self.entity.featured)
    );
  },
  get author() {
    return (
      (self.ready &&
        self.entity.author &&
        resolveIdentifier(Entity, self, join('author', self.entity.author))) ||
      authorShape('author', self.ready && self.entity.author)
    );
  },
  get meta() {
    return (self.ready && self.entity.meta) || metaShape;
  },
});

const taxonomy = self => ({
  get name() {
    return self.ready ? self.entity.name : '';
  },
});

const media = self => ({
  get caption() {
    return self.ready ? self.entity.caption : '';
  },
  get description() {
    return self.ready ? self.entity.description : '';
  },
  get alt() {
    return self.ready ? self.entity.alt : '';
  },
  get mimeType() {
    return self.ready ? self.entity.mimeType : '';
  },
  get mediaType() {
    return self.ready ? self.entity.mediaType : '';
  },
  get original() {
    return self.ready ? self.entity.original : originalShape;
  },
  get sizes() {
    return self.ready ? self.entity.sizes : [];
  },
});

const author = self => ({
  get name() {
    return self.ready ? self.entity.name : '';
  },
  get slug() {
    return self.ready ? self.entity.slug : '';
  },
  get description() {
    return self.ready ? self.entity.description : '';
  },
  get avatar() {
    return self.ready ? self.entity.avatar : '';
  },
});

const Entity = types
  .model('Entity')
  .props({
    mstId: types.identifier(types.string), // post_60, category_7, movie_34, author_3, media_35
    type: types.string,
    id: types.number,
    fetching: false,
    entity: types.frozen,
  })
  .views(common)
  .views(single)
  .views(taxonomy)
  .views(media)
  .views(author);

export default Entity;
