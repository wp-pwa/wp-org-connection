import { schema } from 'normalizr';
import { post } from './posts';
import { taxonomy } from './taxonomies';
import { author } from './authors';

export const single = new schema.Union(
  {
    post,
    taxonomy,
    author,
  },
  val => {
    if (val.taxonomy) return 'taxonomy';
    else if (val.name) return 'author';
    return 'post';
  }
);

export const list = new schema.Array(single);
