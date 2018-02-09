import { schema } from 'normalizr';

export const author = new schema.Entity(
  'author',
  {},
  {
    processStrategy(entity) {
      entity.mst = 'author';
      entity.type = 'author';
      return entity;
    },
  },
);
export const authors = new schema.Array(author);
