import { types } from 'mobx-state-tree';

const Home = types.model('Home').props({
  title: types.optional(types.string, 'WP-PWA'),
  description: types.optional(types.string, '')
});

export default types.model('SiteInfo').props({
  home: types.optional(Home, {}),
  headContent: types.optional(types.array(types.frozen), []),
  perPage: types.optional(types.number, 10)
});
