import { types } from 'mobx-state-tree';

export default types.model('Head').props({
  title: types.optional(types.string, ''),
  content: types.optional(types.frozen, []),
  hasFailed: false,
});
