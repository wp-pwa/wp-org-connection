import { schema } from 'normalizr';

export const author = new schema.Entity('users');
export const authors = new schema.Array(author);
