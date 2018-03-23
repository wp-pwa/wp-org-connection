import { normalize } from 'normalizr';
import convert from '../';
import post60 from '../../__tests__/post-60.json';
import media212 from '../../__tests__/media-212.json';
import page184 from '../../__tests__/page-with-subpage.json';
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

const { entities: entitiesFromMedia212 } = normalize(media212, entity);
test('Convert media', () => {
  expect(convert(entitiesFromMedia212.media[212])).toMatchSnapshot();
});

const { entities: entitiesFromPage184 } = normalize(page184, entity);
test('Convert page', () => {
  expect(convert(entitiesFromPage184.single[184])).toMatchSnapshot();
});
