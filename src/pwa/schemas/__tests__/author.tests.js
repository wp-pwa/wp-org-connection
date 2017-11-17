import { normalize } from 'normalizr';
import author4 from './api/author-4.json';
import authorList from './api/author-list.json';
import { author, authors } from '../authors';

test('Convert a author', () => {
  const { entities } = normalize(author4, author);
  expect(entities.author[4].id).toBe(4);
  expect(entities.author[4].slug).toBe('alan');
});

test('Convert a author list', () => {
  const { entities } = normalize(authorList, authors);
  expect(entities.author[6].id).toBe(6);
  expect(entities.author[6].slug).toBe('david');
});
