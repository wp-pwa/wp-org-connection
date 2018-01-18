import { schema } from 'normalizr';
import { post } from './posts';
import { taxonomy } from './taxonomies';
import { author } from './authors';
import { media } from './media';

export const single = new schema.Union(
  {
    post,
    taxonomy,
    author,
    media,
  },
  val => {
    if (val.taxonomy) return 'taxonomy';
    else if (val.name) return 'author';
    else if (val.media_type) return 'media';
    return 'post';
  }
);

export const list = new schema.Array(single);
