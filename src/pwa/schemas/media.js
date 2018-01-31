import { schema } from 'normalizr';
import { author } from './authors';


export const media = new schema.Entity(
  'media',
  {
    _embedded: {
      author: [author],
    },
  },
);

export const mediaArray = new schema.Array(media);
