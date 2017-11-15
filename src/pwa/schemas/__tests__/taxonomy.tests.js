import { normalize } from 'normalizr';
import category7 from './api/category-7.json';
import tag10 from './api/tag-10.json';
import categoriesList from './api/categories-list.json';
import tagsList from './api/tags-list.json';
import { taxonomy, taxonomies } from '../taxonomies';

test('Convert a category', () => {
  const { entities } = normalize(category7, taxonomy);
  expect(entities.taxonomy[7].id).toBe(7);
  expect(entities.taxonomy[7].slug).toBe('nature');
  expect(entities.taxonomy[7].taxonomy).toBe('category');
});

test('Convert a category list', () => {
  const { entities } = normalize(categoriesList, taxonomies);
  expect(entities.taxonomy[3].id).toBe(3);
  expect(entities.taxonomy[3].slug).toBe('photography');
  expect(entities.taxonomy[3].taxonomy).toBe('category');
});

test('Convert a tag', () => {
  const { entities } = normalize(tag10, taxonomy);
  expect(entities.taxonomy[10].id).toBe(10);
  expect(entities.taxonomy[10].slug).toBe('gullfoss');
  expect(entities.taxonomy[10].taxonomy).toBe('post_tag');
});

test('Convert a tag list', () => {
  const { entities } = normalize(tagsList, taxonomies);
  expect(entities.taxonomy[30].id).toBe(30);
  expect(entities.taxonomy[30].slug).toBe('culture');
  expect(entities.taxonomy[30].taxonomy).toBe('post_tag');
});
