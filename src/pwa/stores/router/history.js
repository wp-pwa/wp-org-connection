/* eslint-disable import/prefer-default-export, global-require, no-eval */
import { when } from 'mobx';
import { isEqual, isMatch, omitBy, isNil } from 'lodash';
import url from 'url';

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

    // debugger;

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
    if (action === 'REPLACE' && isMatch(selectedItem, stateSelectedWithoutNil))
      return;
    if (disposer) disposer();

    // Dispatchs a route-change-succeed action
    self.routeChangeSucceed({ ...state });

    // Updates url when the new item is ready
    const { type, id } = state.selectedItem;
    if (!self.entity(type, id).isReady) {
      disposer = when(
        () => self.entity(type, id).isReady,
        () => {
          const path = getPath(state.selectedItem);
          self.history.replace(path, state);
        },
      );
    }
  });

  let replaceFirstUrl = null;

  return {
    previousContextRequested: () => {
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
    routeChangeRequested: ({
      selectedItem,
      method = 'push',
      context: actionContext,
    }) => {
      const context =
        actionContext ||
        (self.selectedContext &&
        self.selectedContext.hasItem({ item: selectedItem })
          ? self.selectedContext.generator
          : { columns: [[{ ...selectedItem }]] });
      const path = getPath(selectedItem);
      if (['push', 'replace'].includes(method))
        self.history[method](path, { selectedItem, method, context });
    },
    beforeDestroy() {
      if (replaceFirstUrl) replaceFirstUrl();
    },
    replaceFirstUrl: () => {
      replaceFirstUrl = when(
        () => typeof self.selectedItem !== 'undefined',
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
