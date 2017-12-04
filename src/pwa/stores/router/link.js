import { types, getParent, getType } from 'mobx-state-tree';
import { Media, Author, Taxonomy, Post } from '../connection/single';

const Link = types.model('Link')
.props({
  _link: types.maybe(types.string),
})
.views(self => ({
  get url() {
    const { type } = getParent(self);

    if (type === 'latest') {
      // List (without single)
      // if (type === 'archive') return `/?m=${id}`; // check this
      // if (type === 'search') return `/?s=${id}`;
      // if (type === 'latest') return `/?m=${id}`;

      return '/';
    }

    const { link, id, slug, taxonomy } = getParent(self).single;
    const nodeType = getType(getParent(self).single);

    // if (self.pretty) return link;

    // Entities with single
    if (nodeType === Post && type === 'page') return `/?page_id=${id}`;
    if (nodeType === Post) return `/?p=${id}`;

    if (nodeType === Author) return `/?author=${id}`;
    if (nodeType === Media) return `/?attachement_id=${id}`; // does not work

    if (nodeType === Taxonomy && taxonomy === 'category') return `/?cat=${id}`;
    if (nodeType === Taxonomy && taxonomy === 'tag') return `/?tag=${slug}`;
    if (nodeType === Taxonomy) return `/?${taxonomy}=${slug}`; // for custom taxonomies

    return '/';

  },

  get pretty() {
    return !!getParent(self).single.link; //  eslint-disable-line
  },

  paged(page) {
    return self.pretty ? `${self.url}/page/${page}` : `${self.url}&paged=${page}`;
  },
}));

export default Link;
