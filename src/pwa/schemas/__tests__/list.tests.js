import { normalize } from 'normalizr';
import category7 from '../../__tests__/posts-from-category-7.json';
import categoriesList from '../../__tests__/categories-list.json';
import tagsList from '../../__tests__/tags-list.json';
import authorList from '../../__tests__/author-list.json';
import { list } from '../';

test('Convert list of posts using list', () => {
  const { entities } = normalize(category7, list);
  expect(entities).toMatchSnapshot();
});

test('Convert a category list', () => {
  const { entities } = normalize(categoriesList, list);
  expect(entities).toMatchSnapshot();
});

test('Convert a tag list', () => {
  const { entities } = normalize(tagsList, list);
  expect(entities).toMatchSnapshot();
});

test('Convert a author list', () => {
  const { entities } = normalize(authorList, list);
  expect(entities).toMatchSnapshot();
});
