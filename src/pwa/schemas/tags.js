import { schema } from 'normalizr';

export const tag = new schema.Entity('tags');
export const tags = new schema.Array(tag);
