import { schema } from 'normalizr';

export const taxonomy = new schema.Entity(
  'taxonomy',
  {},
  {
    processStrategy(entity) {
      entity.taxonomy = entity.taxonomy === 'post_tag' ? 'tag' : entity.taxonomy;
      entity.type = entity.taxonomy;
      entity.mst = 'taxonomy';
      return entity;
    },
  },
);
export const taxonomies = new schema.Array(taxonomy);
