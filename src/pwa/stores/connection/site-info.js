import { types } from 'mobx-state-tree';

export default types.model('SiteInfo').props({
  headTitle: types.optional(types.string, ''),
  headContent: types.optional(types.frozen, []),
});
