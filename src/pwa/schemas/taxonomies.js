import { schema } from 'normalizr';

export const taxonomy = new schema.Entity(
  'taxonomy',
  {},
  {
    processStrategy(entity) {
      if (entity.taxonomy === 'post_tag') entity.taxonomy = 'tag';
      entity.mst = 'taxonomy';
      return entity;
    },
  },
);
export const taxonomies = new schema.Array(taxonomy);
