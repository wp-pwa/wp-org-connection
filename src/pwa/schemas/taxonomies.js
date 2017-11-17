import { schema } from 'normalizr';

export const taxonomy = new schema.Entity('taxonomy');
export const taxonomies = new schema.Array(taxonomy);
