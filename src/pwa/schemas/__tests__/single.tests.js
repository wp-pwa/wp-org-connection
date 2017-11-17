import { normalize } from 'normalizr';
import post60 from '../../__tests__/post-60.json';
import category7 from '../../__tests__/category-7.json';
import tag10 from '../../__tests__/tag-10.json';
import author4 from '../../__tests__/author-4.json';
import { single } from '../';

test('Convert post using single', () => {
  const { entities } = normalize(post60, single);
  expect(entities.post[60].id).toBe(60);
  expect(entities.post[60].slug).toBe('the-beauties-of-gullfoss');
  expect(entities.post[60].taxonomiesMap).toEqual({
    category: [3, 8],
    tag: [10, 9, 13, 11],
  });
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

test('Convert a category using single', () => {
  const { entities } = normalize(category7, single);
  expect(entities.taxonomy[7].id).toBe(7);
  expect(entities.taxonomy[7].slug).toBe('nature');
  expect(entities.taxonomy[7].taxonomy).toBe('category');
});

test('Convert a tag using single', () => {
  const { entities } = normalize(tag10, single);
  expect(entities.taxonomy[10].id).toBe(10);
  expect(entities.taxonomy[10].slug).toBe('gullfoss');
  expect(entities.taxonomy[10].taxonomy).toBe('post_tag');
});

test('Convert a author using single', () => {
  const { entities } = normalize(author4, single);
  expect(entities.author[4].id).toBe(4);
  expect(entities.author[4].slug).toBe('alan');
});
