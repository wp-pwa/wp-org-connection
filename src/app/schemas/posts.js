import { schema } from 'normalizr';

const author = new schema.Entity('author');
const featuredMedia = new schema.Entity('featured_media');
const category = new schema.Entity('categories');
const categories = new schema.Array(category);
const tag = new schema.Entity('tags');
const tags = new schema.Array(tag);
const term = new schema.Array({
  category: categories,
  post_tag: tags,
}, input => input[0] && input[0].taxonomy);
const post = new schema.Entity('post', { _embedded: {
  author: [author],
  'wp:featuredmedia': [featuredMedia],
  'wp:term': term,
} });
export default new schema.Array(post);
