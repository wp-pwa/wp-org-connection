import { schema } from 'normalizr';

export const media = new schema.Entity('media');
export const mediaArray = new schema.Array(media);
