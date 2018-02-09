import { normalize } from 'normalizr';
import convert from '../';
import post60 from '../../__tests__/post-60.json';
import media2687 from '../../__tests__/media-2687.json';
import page260 from '../../__tests__/page-with-subpage.json';
import { entity } from '../../schemas';

const { entities: entitiesFromPost60 } = normalize(post60, entity);

test('Convert post', () => {
  expect(convert(entitiesFromPost60.single[60])).toMatchSnapshot();
});

test('Convert category', () => {
  expect(convert(entitiesFromPost60.taxonomy[3])).toMatchSnapshot();
});

test('Convert tag', () => {
  expect(convert(entitiesFromPost60.taxonomy[9])).toMatchSnapshot();
});

test('Convert author', () => {
  expect(convert(entitiesFromPost60.author[4])).toMatchSnapshot();
});

test('Convert media from post', () => {
  expect(convert(entitiesFromPost60.media[62])).toMatchSnapshot();
});

const { entities: entitiesFromMedia2687 } = normalize(media2687, entity);
test('Convert media', () => {
  expect(convert(entitiesFromMedia2687.media[2687])).toMatchSnapshot();
});

const { entities: entitiesFromPage260 } = normalize(page260, entity);
test('Convert page', () => {
  expect(convert(entitiesFromPage260.single[260])).toMatchSnapshot();
});
