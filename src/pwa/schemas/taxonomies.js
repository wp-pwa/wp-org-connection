import { schema } from 'normalizr';

export const taxonomy = new schema.Entity(
  'taxonomy',
  {},
  {
    processStrategy(entity) {
      entity.type = entity.taxonomy === 'post_tag' ? 'tag' : entity.taxonomy;
      delete entity.taxonomy;
      entity.mst = 'taxonomy';
      return entity;
    },
  },
);
export const taxonomies = new schema.Array(taxonomy);
