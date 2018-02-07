import { schema } from 'normalizr';
import { single } from './singles';
import { taxonomy } from './taxonomies';
import { author } from './authors';
import { media } from './medias';

export const entity = new schema.Union(
  {
    single,
    taxonomy,
    author,
    media,
  },
  val => {
    if (val.taxonomy) return 'taxonomy';
    else if (val.media_type) return 'media';
    else if (val.name) return 'author';
    return 'single';
  },
);

export const list = new schema.Array(entity);
