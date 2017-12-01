/* eslint-disable no-underscore-dangle */
import { schema } from 'normalizr';
import { taxonomy } from './taxonomies';
import { author } from './authors';

const media = new schema.Entity('media');

const taxonomies = new schema.Array(new schema.Array(taxonomy));

export const post = new schema.Entity(
  'post',
  {},
  {
    processStrategy(entity) {
      const result = { ...entity };

      if (entity._embedded) {
        // Get all taxonomies and generate a map so we can know later on which props
        // are actually taxonomies.
        if (entity._embedded['wp:term']) {
          result.taxonomiesMap = {};
          entity._embedded['wp:term'].forEach(term =>
            term.forEach(item => {
              const type = item.taxonomy === 'post_tag' ? 'tag' : item.taxonomy;
              result.taxonomiesMap[type] = result.taxonomiesMap[type] || [];
              result.taxonomiesMap[type].push(item.id);
            }),
          );
        }

        // Check if there is any media missing and build an object with
        // id, type and an error message containing the original item,
        // to be able to populate the store.
        if (entity._embedded['wp:featuredmedia']) {
          entity._embedded['wp:featuredmedia'].forEach((item, index) => {
            if (!item.id) {
              result._embedded['wp:featuredmedia'][index] = {
                id: entity.featured_media,
                type: 'media',
                error: item,
              };
            }
          });
        }
      }

      return result;
    },
  },
);

post.define({
  _embedded: {
    author: [author],
    'wp:featuredmedia': [media],
    'wp:term': taxonomies,
    up: post,
  },
});

export const posts = new schema.Array(post);
