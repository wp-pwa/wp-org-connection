/* eslint-disable import/prefer-default-export, global-require, no-eval */
import { getEnv } from 'mobx-state-tree';
import { when } from 'mobx';
import { isEqual, isMatch, omitBy, isNil } from 'lodash';
import url from 'url';
import { routeChangeSucceed } from '../../actions';
import * as actionTypes from '../../actionTypes';

export const actions = self => {
  // Initialize historyKeys
  const historyKeys = [];
  const contextKeys = [];
  let currentKey = 0;
  let disposer = null;
  let goingToPreviousContext = false;

  const isBrowser = typeof window !== 'undefined' && !window.process;

  const createHistory = isBrowser
    ? require('history/createBrowserHistory').default
    : eval('require("history/createMemoryHistory").default');

  // Returns the path from the item specified.
  const getPath = ({ type, id, page }) => {
    const entity = self.entity(type, id);
    const link = page ? entity.pagedLink(page) : entity.link;
    const { path } = url.parse(link);
    return path;
  };

  self.history = createHistory();
  self.history.listen(async (location, action) => {
    const { state, key } = location;
    const { selectedItem, selectedContext } = self;
    const generator = selectedContext ? selectedContext.generator : null;

    // If context has changed, stores the key in contextKeys
    if (
      !goingToPreviousContext &&
      historyKeys.length &&
      state.context &&
      (!selectedContext || !isEqual(generator, state.context))
    ) {
      contextKeys.push(historyKeys[currentKey]);
    }

    // Sets the 'goingToPreviousContext' flag to false after checking it.
    goingToPreviousContext = false;

    if (action === 'PUSH') {
      if (historyKeys.length) currentKey += 1;
      historyKeys[currentKey] = key;
    } else if (action === 'REPLACE') {
      historyKeys[currentKey] = key;
    } else if (action === 'POP') {
      const newIndex = historyKeys.indexOf(key);
      if (newIndex > currentKey) state.method = 'forward';
      else state.method = 'backward';
      currentKey = newIndex;
    }

    const stateSelectedWithoutNil = omitBy(state.selectedItem, isNil);

    // Prevents a dispatch when just replacing the URL
    if (action === 'REPLACE' && isMatch(selectedItem, stateSelectedWithoutNil)) return;
    if (disposer) disposer();

    // Dispatchs a route-change-succeed action
    getEnv(self).store.dispatch(routeChangeSucceed({ ...state }));

    // Updates url when the new item is ready
    const { type, id } = state.selectedItem;
    if (!self.entity(type, id).ready) {
      disposer = when(
        () => self.entity(type, id).ready,
        () => {
          const path = getPath(state.selectedItem);
          self.history.replace(path, state);
        },
      );
    }
  });

  return {
    [actionTypes.PREVIOUS_CONTEXT_REQUESTED]: () => {
      if (contextKeys.length < 1) return;

      const [previousContextKey] = contextKeys.slice(-1);

      const pagesBack = currentKey - historyKeys.indexOf(previousContextKey);
      if (pagesBack <= currentKey) {
        goingToPreviousContext = true;
        contextKeys.pop();
        // WARNING - the next call is synchronous in the server BUT not in the client!
        self.history.go(-pagesBack);
      }
    },
    [actionTypes.ROUTE_CHANGE_REQUESTED]: action => {
      const { selectedItem, method } = action;
      const path = getPath(selectedItem);
      if (['push', 'replace'].includes(method)) self.history[method](path, action);
    },
    afterCreate: () => {
      disposer = when(
        () => self.selectedItem !== null,
        () => {
          // Set the first route in history
          const { selectedItem, selectedContext } = self;
          const path = getPath(selectedItem);
          const search = isBrowser ? window.location.search : '';

          self.history.replace(path + search, {
            selectedItem,
            method: 'push',
            context: selectedContext && selectedContext.generator,
          });
        },
      );
    },
  };
};
