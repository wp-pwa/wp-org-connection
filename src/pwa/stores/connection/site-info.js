import { types } from 'mobx-state-tree';

export default types.model('SiteInfo').props({
  headContent: types.optional(types.array(types.frozen), []),
  perPage: types.optional(types.number, 10),
});
