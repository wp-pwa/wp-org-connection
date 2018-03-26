/* eslint-disable import/prefer-default-export, global-require, no-eval */
import { getEnv } from 'mobx-state-tree';
// import { when } from 'mobx';
import { isEqual, isMatch } from 'lodash';
import { routeChangeSucceed } from '../../actions';
import * as actionTypes from '../../actionTypes';

export const actions = self => {
  // Initialize historyKeys
  const historyKeys = [];
  const contextKeys = [];
  let currentKey = 0;
  // let disposer = null;

  const isBrowser = typeof window !== 'undefined' && !window.process;

  const createHistory = isBrowser
    ? require('history/createBrowserHistory').default
    : eval('require("history/createMemoryHistory").default');


  const history = createHistory();

  // move this to a view?
  self.history = history;

  history.listen((location, action) => {
    const { state, key } = location;
    if (state.context && !isEqual(self.selectedContext.generator, state.context)) {
      contextKeys.push(historyKeys[currentKey]);
    }

    if (action === 'PUSH') {
      currentKey += 1;
      historyKeys[currentKey] = key;
    } else if (action === 'REPLACE') {
      historyKeys[currentKey] = key;
    } else if (action === 'POP') {
      const newIndex = historyKeys.indexOf(key);
      if (newIndex > currentKey) state.method = 'forward';
      else state.method = 'back';
      currentKey = newIndex;
    }

    // Prevents an event emission when just replacing the URL
    if (!(isMatch(self.selected, state.selected) && action === 'REPLACE')) {
      getEnv(self).dispatch(routeChangeSucceed({ ...state }));
    }
  });

  return {
    [actionTypes.PREVIOUS_CONTEXT_REQUESTED]: () => {
      const pagesBack = currentKey - historyKeys.indexOf(contextKeys.pop());
      if (pagesBack <= currentKey) history.go(-pagesBack);
    },
    [actionTypes.ROUTE_CHANGE_REQUESTED]: action => {
      const { selectedItem, method } = action;
      const { type, id, page } = selectedItem;
      const entity = self.entity(type, id);
      const path = page ? entity.pagedLink(page) : entity.link;

      // Methods that are not executed directly from history
      if (['push', 'replace'].includes(method)) history[method](path, action);
    },
    replaceUrl: (url, state = history.location.state) => {
      history.replace(url, state);
    },
    afterCreate: () => {
      const { selectedItem, selectedContext } = self;

      if (selectedItem !== null) {
        const { page } = selectedItem;
        const path = page ? selectedItem.entity.pagedLink(page) : selectedItem.entity.link;
        const search = isBrowser ? window.location.search : '';

        // First route in history
        history.replace(path + search, {
          selectedItem,
          method: 'push',
          context: selectedContext.generator,
        });
      }
    },
  };
};
