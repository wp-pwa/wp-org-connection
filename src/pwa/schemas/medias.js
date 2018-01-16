import { schema } from 'normalizr';
import { author } from './authors';

export const media = new schema.Entity(
  'media',
  {
    _embedded: {
      author: [author],
    },
  },
  {
    processStrategy(entity) {
      entity.mst = 'media';
      return entity;
    },
  },
);

export const medias = new schema.Array(media);
