import { normalize } from 'normalizr';
import category7 from './api/posts-from-category-7.json';
import categoriesList from './api/categories-list.json';
import tagsList from './api/tags-list.json';
import authorList from './api/author-list.json';
import { list } from '../';

test('Convert list of posts using list', () => {
  const { entities } = normalize(category7, list);
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

test('Convert a category list', () => {
  const { entities } = normalize(categoriesList, list);
  expect(entities.taxonomy[3].id).toBe(3);
  expect(entities.taxonomy[3].slug).toBe('photography');
  expect(entities.taxonomy[3].taxonomy).toBe('category');
});

test('Convert a tag list', () => {
  const { entities } = normalize(tagsList, list);
  expect(entities.taxonomy[30].id).toBe(30);
  expect(entities.taxonomy[30].slug).toBe('culture');
  expect(entities.taxonomy[30].taxonomy).toBe('post_tag');
});

test('Convert a author list', () => {
  const { entities } = normalize(authorList, list);
  expect(entities.author[6].id).toBe(6);
  expect(entities.author[6].slug).toBe('david');
});
