import { types } from 'mobx-state-tree';
import * as connection from './connection';
import * as router from './router';

const Connection = types
  .model('Connection')
  .props(connection.props)
  .views(connection.views)
  .actions(connection.actions)
  .props(router.props)
  .views(router.views)
  .actions(router.actions);

export default Connection;
