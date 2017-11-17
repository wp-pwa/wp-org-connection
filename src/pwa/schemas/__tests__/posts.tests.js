import { normalize } from 'normalizr';
import post60 from './api/post-60.json';
import category7 from './api/posts-from-category-7.json';
import { post, posts } from '../posts';

test('Convert post', () => {
  const { entities } = normalize(post60, post);
  expect(entities.post[60].id).toBe(60);
  expect(entities.post[60].slug).toBe('the-beauties-of-gullfoss');
  expect(entities.media[62].id).toBe(62);
  expect(entities.media[62].slug).toBe('iceland-test');
  expect(entities.author[4].id).toBe(4);
  expect(entities.author[4].slug).toBe('alan');
  expect(entities.taxonomy[3].id).toBe(3);
  expect(entities.taxonomy[3].slug).toBe('photography');
  expect(entities.taxonomy[3].taxonomy).toBe('category');
  expect(entities.taxonomy[10].id).toBe(10);
  expect(entities.taxonomy[10].slug).toBe('gullfoss');
  expect(entities.taxonomy[10].taxonomy).toBe('post_tag');
});

test('Convert list of posts', () => {
  const { entities } = normalize(category7, posts);
  expect(entities.post[57].id).toBe(57);
  expect(entities.post[57].slug).toBe('shinjuku-gyoen-national-garden');
  expect(entities.media[55].id).toBe(55);
  expect(entities.media[55].slug).toBe('canyon');
  expect(entities.author[4].id).toBe(4);
  expect(entities.author[4].slug).toBe('alan');
  expect(entities.taxonomy[3].id).toBe(3);
  expect(entities.taxonomy[3].slug).toBe('photography');
  expect(entities.taxonomy[3].taxonomy).toBe('category');
  expect(entities.taxonomy[15].id).toBe(15);
  expect(entities.taxonomy[15].slug).toBe('japan');
  expect(entities.taxonomy[15].taxonomy).toBe('post_tag');
});
