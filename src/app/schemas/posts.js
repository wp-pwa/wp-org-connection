import { schema } from 'normalizr';

const author = new schema.Entity('users');
const featuredMedia = new schema.Entity('media');
const category = new schema.Entity('categories');
const categories = new schema.Array(category);
const tag = new schema.Entity('tags');
const tags = new schema.Array(tag);
const term = new schema.Array({
  category: categories,
  post_tag: tags,
}, input => input[0] && input[0].taxonomy);
const post = new schema.Entity('posts', { _embedded: {
  author: [author],
  'wp:featuredmedia': [featuredMedia],
  'wp:term': term,
} });
export default new schema.Array(post);
