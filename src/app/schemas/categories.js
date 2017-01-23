import { schema } from 'normalizr';

const category = new schema.Entity('categories');
export default new schema.Array(category);
