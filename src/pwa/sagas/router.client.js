/* eslint-disable global-require */
// import { when } from 'mobx';
import { takeEvery, put } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import createHistory from 'history/createBrowserHistory';
import * as actionTypes from '../actionTypes';

import * as actions from '../actions';

// const latestLink = ({ listId, page }) => (page > 1 ? `/${listId}/page/${page}` : `/${listId}`);
//
// const listPlainLink = ({ listType, listId, page }) => {
//   const paged = page > 1 ? `&paged=${page}` : '';
//   switch (listType) {
//     case 'author':
//       return `/?author=${listId}${paged}`; // This is a list, isn't it?
//     case 'search':
//       return `/?s=${listId}${paged}`; // This is a list, isn't it?
//     default:
//       return '/';
//   }
// };
//
// const singlePlainLink = ({ singleType, singleId }) => {
//   switch (singleType) {
//     case 'page':
//       return `/?page_id=${singleId}`;
//     case 'category':
//       return `/?cat=${singleId}`;
//     case 'tag':
//       return `/?tag=${singleId}`; // slug
//     case 'media':
//       return `/?attachment_id=${singleId}`;
//     default:
//       return `/?p=${singleId}`;
//   }
// };

const routeChanged = history =>
  eventChannel(emitter => {
    const unlisten = history.listen(location => {
      const { pathname, state } = location;
      emitter({ pathname, ...state });
    });
    return unlisten;
  });

export function* handleHistoryRouteChanges(changed) {
  yield put(actions.routeChangeSucceed(changed));
}

// const populateWhenReady = ({ listType, listId, page = 1 }, store) => {
//   when(
//     () => {
//       debugger;
//       return store.list[listType][listId].page[page - 1].ready;
//     },
//     () => {
//       const { entities } = store.list[listType][listId].page[page - 1];
//       console.log('YEEEEAH');
//
//       [...store.context.items].filter(({ fromList }) =>
//         fromList &&
//         fromList.id === listId && fromList.type === listType && fromList.page === page,
//       ).forEach((item, i) => {
//         // JODER
//         item.singleType = entities[i].type;
//         item.singleId = entities[i].id;
//       });
//     },
//   );
// };

export const requestHandlerCreator = ({ store, history }) =>
  function* handleRequest({ selected, method, context }) {
    const { listType, listId, page, singleType, singleId } = selected;
    const type = listType || singleType;
    const id = listType ? listId : singleId
    console.log(type, id);
    const { link } = store.single[type][id];
    const url = `${link}${page > 1 ? `/page/${page}` : ''}`
    if (['push', 'replace'].includes(method)) {
      yield history[method](url, { selected, method, context });
    }
  };

// const succeedHandlerCreator = ({ store }) =>
//   function* handleRequest({ context }) {
//     yield context && context.items
//       .filter(item => item.extract)
//       .forEach(item => populateWhenReady(item, store));
//   };

export default ({ store, history = createHistory() }) =>
  function* routerSaga() {
    const { type, id, listType, listId, singleType, singleId, page } = store.selected;
    const context = store.context.index;
    const { generator } = store.context;
    history.replace(`/${type}/${id}/${page}/${context}`, {
      selected: { listType, listId, page, singleType, singleId },
      method: 'push',
      context: generator,
    });

    // Initializate router event channels.
    const routeChangedEvents = routeChanged(history);

    // Track router events and dispatch them to redux.
    yield takeEvery(routeChangedEvents, handleHistoryRouteChanges);
    yield takeEvery(actionTypes.ROUTE_CHANGE_REQUESTED, requestHandlerCreator({ store, history }));
    // yield takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, succeedHandlerCreator({ store, history }));
  };
