import { normalize } from 'normalizr';
// https://demo.worona.org/?rest_route=/wp/v2/posts&categories=7&_embed=true
import category7 from '../../__tests__/posts-from-category-7.json';
// https://demo.worona.org/?rest_route=/wp/v2/categories&_embed=true&per_page=3
import categoriesList from '../../__tests__/categories-list.json';
// https://demo.worona.org/?rest_route=/wp/v2/tags&_embed=true
import tagsList from '../../__tests__/tags-list.json';
// https://demo.worona.org/?rest_route=/wp/v2/users&_embed=true
import authorList from '../../__tests__/author-list.json';
// https://demo.worona.org/?rest_route=/wp/v2/media&_embed=true
import mediaList from '../../__tests__/media-list.json';
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

test('Convert a media list', () => {
  const { entities } = normalize(mediaList, list);
  expect(entities).toMatchSnapshot();
});
