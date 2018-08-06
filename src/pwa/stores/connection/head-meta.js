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
  get title() {
    const { initialSelectedItem: initial } = getEnv(self);
    const { head } = getParent(self, 3);
    const entity = getParent(self);

    return head.title && isMatch(entity, { type: initial.type, id: initial.id })
      ? head.title
      : getEntityTitle(entity);
  },
  pagedTitle(page) {
    if (!page) return self.title;

    const { initialSelectedItem: initial } = getEnv(self);
    const { head } = getParent(self, 3);
    const entity = getParent(self);

    return head.title &&
      isMatch(entity, { type: initial.type, id: initial.id }) &&
      page === initial.page
      ? head.title
      : getEntityTitle(entity);
  },
}));
