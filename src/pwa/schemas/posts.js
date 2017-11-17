/* eslint-disable no-underscore-dangle */
import { schema } from 'normalizr';

const author = new schema.Entity('author');
const media = new schema.Entity('media');
const taxonomy = new schema.Entity('taxonomy');
const taxonomies = new schema.Array(new schema.Array(taxonomy));
export const post = new schema.Entity(
  'post',
  {},
  {
    processStrategy(entity) {
      // Get all taxonomies and generate a map so we can now later on which props are actually
      // taxonomies.
      if (entity._embedded && entity._embedded['wp:term']) {
        const taxonomiesMap = {};
        entity._embedded['wp:term'].forEach(term =>
          term.forEach(item => {
            const type = item.taxonomy === 'post_tag' ? 'tag' : item.taxonomy;
            taxonomiesMap[type] = taxonomiesMap[type] || [];
            taxonomiesMap[type].push(item.id);
          }),
        );
        return { ...entity, taxonomiesMap };
      }
      return entity;
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
