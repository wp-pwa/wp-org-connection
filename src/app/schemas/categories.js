import { schema } from 'normalizr';

export const category = new schema.Entity('categories');
export const categories = new schema.Array(category);
