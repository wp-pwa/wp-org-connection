/* eslint-disable no-underscore-dangle */
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
      if (entity._embedded && entity._embedded['wp:term']) {
        entity._embedded['wp:term'].forEach(term =>
          term.forEach((item, index) => {
            if (item.taxonomy === 'latest') term.splice(index, 1);
          }),
        );
      }
      return result;
    },
  },
);

export const mediaArray = new schema.Array(media);
