import { normalize } from 'normalizr';
import convert from '../';
import post60 from '../../__tests__/post-60.json';
import { entity } from '../../schemas';

const { entities } = normalize(post60, entity);

test('Convert post', () => {
  expect(convert(entities.single[60])).toMatchSnapshot();
});

test('Convert category', () => {
  expect(convert(entities.taxonomy[3])).toMatchSnapshot();
});

test('Convert tag', () => {
  expect(convert(entities.taxonomy[9])).toMatchSnapshot();
});

test('Convert author', () => {
  expect(convert(entities.author[4])).toMatchSnapshot();
});

test('Convert media', () => {
  expect(convert(entities.media[62])).toMatchSnapshot();
});
