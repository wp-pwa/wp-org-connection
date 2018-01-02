import { normalize } from 'normalizr';
import post60 from '../../__tests__/post-60.json';
import category7 from '../../__tests__/category-7.json';
import tag10 from '../../__tests__/tag-10.json';
import author4 from '../../__tests__/author-4.json';
import { single } from '../';

test('Convert post using single', () => {
  const { entities } = normalize(post60, single);
  expect(entities.post[60]).toMatchSnapshot();
  expect(entities.media[62]).toMatchSnapshot();
  expect(entities.taxonomy[3]).toMatchSnapshot();
  expect(entities.taxonomy[10]).toMatchSnapshot();
  expect(entities.author[4]).toMatchSnapshot();
});

test('Convert a category using single', () => {
  const { entities } = normalize(category7, single);
  expect(entities.taxonomy[7]).toMatchSnapshot();
});

test('Convert a tag using single', () => {
  const { entities } = normalize(tag10, single);
  expect(entities.taxonomy[10]).toMatchSnapshot();
});

test('Convert a author using single', () => {
  const { entities } = normalize(author4, single);
  expect(entities.author[4]).toMatchSnapshot();
});
