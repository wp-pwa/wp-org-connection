import convert, { post, taxonomy, author, media } from '../';
import post60normalized from '../../__tests__/post-60-normalized.json';
import post60converted from '../../__tests__/post-60-converted.json';
import category3converted from '../../__tests__/category-3-converted.json';
import tag9converted from '../../__tests__/tag-9-converted.json';
import author4converted from '../../__tests__/author-4-converted.json';
import media62converted from '../../__tests__/media-62-converted.json';

test('Convert post', () => {
  const post60 = post60normalized.post[60];
  expect(post(post60)).toEqual(post60converted);
  expect(convert(post60)).toEqual(post60converted);
});

test('Convert category', () => {
  const category = post60normalized.taxonomy[3];
  expect(taxonomy(category)).toEqual(category3converted);
  expect(convert(category)).toEqual(category3converted);
});

test('Convert tag', () => {
  const tag = post60normalized.taxonomy[9];
  expect(taxonomy(tag)).toEqual(tag9converted);
  expect(convert(tag)).toEqual(tag9converted);
});

test('Convert author', () => {
  const author4 = post60normalized.author[4];
  expect(author(author4)).toEqual(author4converted);
  expect(convert(author4)).toEqual(author4converted);
});

test('Convert media', () => {
  const media62 = post60normalized.media[62];
  expect(media(media62)).toEqual(media62converted);
  expect(convert(media62)).toEqual(media62converted);
});
