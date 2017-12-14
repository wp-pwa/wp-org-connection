/* eslint-disable no-underscore-dangle */
import { types, getParent, getType } from 'mobx-state-tree';
import { parse } from 'url';
import { Media, Author, Taxonomy, Post } from '../connection/single';

const Link = types.model('Link')
.views(self => ({
  get url() {
    const { _link, id, type, taxonomy } = getParent(self);
    const nodeType = getType(getParent(self));

    if (self.pretty) {
      const { pathname, search } = parse(_link);
      return `${pathname}${search || ''}`;
    }

    // Entities with single
    if (nodeType === Post && type === 'page') return `/?page_id=${id}`;
    if (nodeType === Post) return `/?p=${id}`;
    if (nodeType === Author) return `/?author=${id}`;
    if (nodeType === Media) return `/?attachement_id=${id}`; // does not work
    if (nodeType === Taxonomy && taxonomy === 'category') return `/?cat=${id}`;

    return '/';
  },

  get pretty() {
    return !!getParent(self)._link;
  },

  paged(page) {
    return self.pretty ? `${self.url}/page/${page}` : `${self.url}&paged=${page}`;
  },
}));

export default Link;
