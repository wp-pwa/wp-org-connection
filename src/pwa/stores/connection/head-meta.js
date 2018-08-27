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
    if (
      self.head.title &&
      isMatch(self.entity, { type: self.initial.type, id: self.initial.id })
    ) {
      return self.head.title;
    }
    return self.entity.isReady ? getEntityTitle(self.entity) : '';
  },
  pagedTitle(page) {
    if (!page) return self.title;
    if (
      self.head.title &&
      isMatch(self.entity, { type: self.initial.type, id: self.initial.id }) &&
      page === self.initial.page
    ) {
      return self.head.title;
    }
    return self.entity.isReady ? getEntityTitle(self.entity) : '';
  },
}));
