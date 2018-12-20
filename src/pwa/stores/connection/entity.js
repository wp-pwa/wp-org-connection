/* eslint-disable no-use-before-define */
import { observable } from 'mobx';
import { types, resolveIdentifier, getParent } from 'mobx-state-tree';
import { parse } from 'url';
import HeadMeta from './head-meta';
import { join, extract } from './utils';
import entityShape, {
  link,
  pagedLink,
  mediaShape,
  authorShape,
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
          self.raw.featured_media &&
          resolveIdentifier(
            Entity,
            self,
            join('media', self.raw.featured_media),
          )) ||
        mediaShape('media', self.isReady && self.raw.featured_media),
      content:
        self.isReady && self.raw.content_media
          ? self.raw.content_media
          : observable([]),
    };
  },
  get meta() {
    return self.isReady ? self.raw.meta : '';
  },
  get hasFeaturedMedia() {
    return self.isReady && self.raw.featured_media !== null;
  },
  get author() {
    return (
      (self.isReady &&
        self.raw.author &&
        resolveIdentifier(Entity, self, join('author', self.raw.author))) ||
      authorShape('author', self.isReady && self.raw.author)
    );
  },
});

const taxonomy = self => ({
  get name() {
    return self.isReady ? self.raw.name : '';
  },
});

const media = self => {
  // Returns true if width/height ratio of both objects are very, very close.
  // Used when computing the srcSet attribute value.
  const sameRatio = ({ width: w1, height: h1 }, { width: w2, height: h2 }) =>
    Math.abs(w1 / h1 - w2 / h2) < 0.01;

  return {
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
    get src() {
      if (self.isReady) {
        const { cdn } = getParent(self, 3).settings.connection;
        const { path } = parse(self.original.url);

        if (cdn && cdn.media && path) return `${cdn.media}${path}`;

        return self.original.url;
      }

      return '';
    },
    get srcSet() {
      if (self.isReady) {
        const { cdn } = getParent(self, 3).settings.connection;

        // Reduces sizes array to those not repeated and with the same
        // ratio than the original one.
        const reducedSizes = self.sizes.reduce((final, current) => {
          if (
            sameRatio(current, self.original) &&
            !final.find(size => size.width === current.width)
          ) {
            final.push(current);
          }

          return final;
        }, []);

        // If there are no reduced sizes use src and original width.
        if (!reducedSizes.length) {
          return self.src ? `${self.src} ${self.original.width || 100}w` : '';
        }
        // Maps the reduced sizes array into the couples ['url size'] needed
        // for the srcSet attribute.
        const mappedSizes = reducedSizes.map(size => {
          const { path } = parse(size.url);
          const url =
            cdn && cdn.media && path ? `${cdn.media}${path}` : size.url;

          return `${url} ${size.width}w`;
        });

        // Joins the mapped sizes array into the string needed for srcSet.
        const srcSet = mappedSizes.join(', ');

        return srcSet || '';
      }

      return '';
    },
    get original() {
      if (self.isReady) {
        const url = self.raw.source_url || '';
        const {
          width = null,
          height = null,
          file: filename = '',
        } = self.raw.media_details;

        const original = {
          width,
          height,
          filename,
          url,
        };

        if (width && height && filename && url) return original;

        if (self.sizes && self.sizes.length > 0)
          return self.sizes.reduce((current, final) => {
            if (current.width > final.width) return current;
            return final;
          }, []);

        return original;
      }

      return originalShape;
    },
    get sizes() {
      return self.isReady && self.raw.media_details.sizes
        ? Object.values(self.raw.media_details.sizes).map(image => ({
            height: image.height,
            width: image.width,
            filename: image.file,
            url: image.source_url,
          }))
        : observable([]);
    },
  };
};

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
    mstId: types.identifier, // post_60, category_7, movie_34, author_3, media_35
    type: types.string,
    id: types.union(types.number, types.string),
    isFetching: false,
    hasFailed: false,
    raw: types.frozen(),
    headMeta: types.optional(HeadMeta, {}),
  })
  .views(common)
  .views(single)
  .views(taxonomy)
  .views(media)
  .views(author);

export default Entity;
