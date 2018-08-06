import { types, getParent, getEnv } from 'mobx-state-tree';
import { isMatch } from 'lodash';
import { decode } from 'he';

const getEntityTitle = entity =>
  decode(
    (entity.raw.yoast_meta && entity.raw.yoast_meta.title) ||
      entity.raw.name ||
      entity.raw.title.rendered,
  ).replace(/<\/?[^>]+(>|$)/g, '');

export default types.model('HeadMeta').views(self => ({
  get head() {
    return getParent(self, 3).head;
  },
  get entity() {
    return getParent(self);
  },
  get initial() {
    return getEnv(self).initialSelectedItem;
  },
  get title() {
    return self.head.title &&
      isMatch(self.entity, { type: self.initial.type, id: self.initial.id })
      ? self.head.title
      : getEntityTitle(self.entity);
  },
  pagedTitle(page) {
    if (!page) return self.title;
    return self.head.title &&
      isMatch(self.entity, { type: self.initial.type, id: self.initial.id }) &&
      page === self.initial.page
      ? self.head.title
      : getEntityTitle(self.entity);
  },
}));
