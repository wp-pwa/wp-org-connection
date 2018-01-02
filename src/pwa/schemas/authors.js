import { schema } from 'normalizr';

export const author = new schema.Entity(
  'author',
  {},
  {
    processStrategy(entity) {
      entity.mst = 'author';
      return entity;
    },
  },
);
export const authors = new schema.Array(author);
