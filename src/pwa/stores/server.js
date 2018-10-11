import { flow } from 'mobx-state-tree';
import base from '.';
import headActions from './connection/head/actions';

export default base.actions(headActions).actions(self => ({
  beforeSsr: flow(function* connectionBeforeSsr() {
    yield self.fetchHeadContent();
  }),
}));
