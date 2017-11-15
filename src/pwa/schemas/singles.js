import { schema } from 'normalizr';

const author = new schema.Entity('author');
const media = new schema.Entity('media');
const taxonomy = new schema.Entity('taxonomy');
const taxonomies = new schema.Array(new schema.Array(taxonomy));
export const single = new schema.Entity('single')
single.define({
  _embedded: {
    author: [author],
    'wp:featuredmedia': [media],
    'wp:term': taxonomies,
    up: single,
  },
})
export const singles = new schema.Array(single);
