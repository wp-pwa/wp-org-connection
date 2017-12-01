import { types, getParent } from 'mobx-state-tree';

const Link = types.model('Link')
.views(self => ({
  get url() {
    const { _link, type, id, slug, taxonomy } = getParent(self);

    if (self.pretty) return _link;

    let url;

    if (type === 'post') url = `?p=${id}`;
    if (taxonomy === 'category') url = `?cat=${id}`;
    if (taxonomy === 'tag') url = `?tag=${slug}`;
    if (type === 'author') url = `?author=${slug}`; // check this
    if (type === 'archive') url = `?m=${id}`; // check this ???
    if (type === 'page') url = `?page_id=${id}`;
    if (type === 'search') url = `?s=${id}`;
    if (type === 'attachement') url = `?attachement_id=${id}`;
    if (type === 'latest') url = `?m=${id}`;

    return url;

    // if (page !== undefined) return `${url}&pages=${page}`;
  },
  get pretty() {
    return !!getParent(self)._link; //  eslint-disable-line
  }
}));

export default Link;
