/* eslint-disable no-underscore-dangle */
import { schema } from 'normalizr';
import { taxonomy } from './taxonomies';
import { author } from './authors';

const media = new schema.Entity(
  'media',
  {},
  {
    processStrategy(entity) {
      entity.mst = 'media';
      return entity;
    },
  },
);

const taxonomies = new schema.Array(new schema.Array(taxonomy));

export const post = new schema.Entity(
  'post',
  {},
  {
    processStrategy(entity) {
      const result = { ...entity, mst: 'post' };

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
