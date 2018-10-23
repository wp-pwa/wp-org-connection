/* eslint-disable func-names */
import { types } from 'mobx-state-tree';
import * as connection from './connection';
import * as router from './router';
import * as history from './router/history';

const Connection = types
  .model('Connection')
  .props(connection.props)
  .views(connection.views)
  .actions(connection.actions)
  .props(router.props)
  .views(router.views)
  .actions(router.actions)
  .actions(history.actions);

export default Connection;
