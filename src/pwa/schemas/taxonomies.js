import { schema } from 'normalizr';

export const taxonomy = new schema.Entity('taxonomy', {}, {
  processStrategy(entity) {
    if (entity.taxonomy === 'post_tag') return { ...entity, taxonomy: 'tag' };
    return entity;
  }
});
export const taxonomies = new schema.Array(taxonomy);
