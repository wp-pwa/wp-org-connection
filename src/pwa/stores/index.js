import { types, getEnv } from 'mobx-state-tree';
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
  .actions(history.actions)
  .actions(self => ({
    afterCreate: () => {
      const { store } = getEnv(self);
      if (store)
        store.subscribe(() => {
          const action = store.getState().lastAction;
          if (self[action.type]) {
            self[action.type](action);
          }
        });
    },
  }));

export default Connection;
