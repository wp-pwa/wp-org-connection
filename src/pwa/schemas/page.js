import { schema } from 'normalizr';

const author = new schema.Entity('users');
const featuredMedia = new schema.Entity('media');
const page = new schema.Entity('pages');
const pages = new schema.Array(page);
page.define({
  _embedded: {
    author: [author],
    'wp:featuredmedia': [featuredMedia],
    up: pages,
  },
});
export default page;
