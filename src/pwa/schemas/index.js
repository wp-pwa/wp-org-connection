import { schema } from 'normalizr';
import { single } from './single';
import { taxonomy } from './taxonomies';
import { author } from './authors';

export const entity = new schema.Union(
  {
    single,
    taxonomy,
    author,
  },
  val => {
    if (val.taxonomy) return 'taxonomy';
    else if (val.name) return 'author';
    return 'single';
  }
);

export const list = new schema.Array(entity);
