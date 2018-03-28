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

  const isBrowser = typeof window !== 'undefined' && !window.process;

  const createHistory = isBrowser
    ? require('history/createBrowserHistory').default
    : eval('require("history/createMemoryHistory").default');

  const history = createHistory();

  // Returns the path from the item specified.
  const getPath = ({ type, id, page }) => {
    const entity = self.entity(type, id);
    const link = page ? entity.pagedLink(page) : entity.link;
    const { path } = url.parse(link);
    return path;
  };

  // move this to a view?
  self.history = history;

  history.listen((location, action) => {
    const { state, key } = location;
    const { selectedItem, selectedContext } = self;

    // If context has changed, stores the key in contextKeys
    if (state.context && (!selectedContext || !isEqual(selectedContext.generator, state.context))) {
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

    const stateSelectedWithoutNil = omitBy(state.selectedItem, isNil);

    // Prevents a dispatch when just replacing the URL
    if ( action === 'REPLACE' && isMatch(selectedItem, stateSelectedWithoutNil)) return;
    if (disposer) disposer();

    // Dispatchs a route-change-succeed action
    getEnv(self).dispatch(routeChangeSucceed({ ...state }));

    // Updates url when the new item is ready
    const { type, id } = state.selectedItem;
    if (!self.entity(type, id).ready) {
      disposer = when(
        () => self.entity(type, id).ready,
        () => {
          const path = getPath(state.selectedItem);
          history.replace(path, state);
        },
      );
    }
  });

  return {
    [actionTypes.PREVIOUS_CONTEXT_REQUESTED]: () => {
      const pagesBack = currentKey - historyKeys.indexOf(contextKeys.pop());
      if (pagesBack <= currentKey) history.go(-pagesBack);
    },
    [actionTypes.ROUTE_CHANGE_REQUESTED]: action => {
      const { selectedItem, method } = action;
      const path = getPath(selectedItem);
      if (['push', 'replace'].includes(method)) history[method](path, action);
    },
    afterCreate: () => {
      const { selectedItem, selectedContext } = self;

      if (selectedItem !== null) {
        const path = getPath(selectedItem);
        const search = isBrowser ? window.location.search : '';

        // First route in history
        history.replace(path + search, {
          selectedItem,
          method: 'push',
          context: selectedContext && selectedContext.generator,
        });
      }
    },
  };
};
