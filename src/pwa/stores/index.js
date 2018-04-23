import { types, getEnv, flow } from 'mobx-state-tree';
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
    server: flow(function* ServerConnection() {
      const asciify = eval('require("asciify")');
      const asciifyPromise = txt => new Promise((resolve, reject) => {
        asciify(txt, (err, res) => { if (err) reject(err); else resolve(res) });
      });
      const awesome = yield asciifyPromise('Frontity!');
      console.log(awesome);
    }),
    afterCreate: () => {
      const { store, isServer } = getEnv(self);
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
