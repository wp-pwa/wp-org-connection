import { schema } from 'normalizr';

const category = new schema.Entity('category');
export default new schema.Array(category);
