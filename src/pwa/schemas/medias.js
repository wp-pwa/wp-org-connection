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
      const result = { ...entity };
      result.mst = 'media';
      result.type = 'media';
      return result;
    },
  },
);

export const medias = new schema.Array(media);
