import { normalize } from 'normalizr';
import post60 from '../../__tests__/post-60.json';
import category7 from '../../__tests__/category-7.json';
import tag10 from '../../__tests__/tag-10.json';
import author4 from '../../__tests__/author-4.json';
import media2687 from '../../__tests__/media-2687.json';
import page260 from '../../__tests__/page-with-subpage.json';
import { entity } from '../';

test('Convert post using entity', () => {
  const { entities } = normalize(post60, entity);
  expect(entities.single[60]).toMatchSnapshot();
  expect(entities.media[62]).toMatchSnapshot();
  expect(entities.taxonomy[3]).toMatchSnapshot();
  expect(entities.taxonomy[10]).toMatchSnapshot();
  expect(entities.author[4]).toMatchSnapshot();
});

test('Convert a category using entity', () => {
  const { entities } = normalize(category7, entity);
  expect(entities.taxonomy[7]).toMatchSnapshot();
});

test('Convert a tag using entity', () => {
  const { entities } = normalize(tag10, entity);
  expect(entities.taxonomy[10]).toMatchSnapshot();
});

test('Convert a author using entity', () => {
  const { entities } = normalize(author4, entity);
  expect(entities.author[4]).toMatchSnapshot();
});

test('Convert a media using entity', () => {
  const { entities } = normalize(media2687, entity);
  expect(entities.media[2687]).toMatchSnapshot();
});

test('Convert a page using entity and ignore subpages', () => {
  const { entities } = normalize(page260, entity);
  expect(entities.single[260]).toMatchSnapshot();
  expect(entities.single[231]).toBe(undefined);
});
