/* eslint-disable global-require */
import { getType } from 'mobx-state-tree';
import { when } from 'mobx';
import { isMatch } from 'lodash';
import { takeEvery, put, call } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import createHistory from 'history/createBrowserHistory';
import * as actionTypes from '../actionTypes';

import { Media, Author, Taxonomy, Post } from '../stores/connection/single';

import * as actions from '../actions';

const routeChanged = history =>
  eventChannel(emitter => {
    const unlisten = history.listen(location => {
      const { pathname, state } = location;
      emitter({ pathname, ...state });
    });
    return unlisten;
  });

export function* handleHistoryRouteChanges(changed) {
  // yield new Promise(resolve => setTimeout(resolve, 1000));
  yield put(actions.routeChangeSucceed(changed));
}

// const getUrl = (item, connection) => {
//   const element = connection.single[item.type][item.id];
//   const { link, type, id, slug, taxonomy } = element;
//   const nodeType = getType(element);
//
//   if (link) return link;
//
//   // Entities with single
//   if (nodeType === Post && type === 'page') return `/?page_id=${id}`;
//   if (nodeType === Post) return `/?p=${id}`;
//
//   if (nodeType === Author) return `/?author=${id}`;
//   if (nodeType === Media) return `/?attachement_id=${id}`; // does not work
//
//   if (nodeType === Taxonomy && taxonomy === 'category') return `/?cat=${id}`;
//   if (nodeType === Taxonomy && taxonomy === 'tag') return `/?tag=${slug}`;
//   if (nodeType === Taxonomy) return `/?${taxonomy}=${slug}`; // for custom taxonomies
//
//   // List (without single)
//   if (type === 'archive') return `/?m=${id}`; // check this
//   if (type === 'search') return `/?s=${id}`;
//   if (type === 'latest') return `/?m=${id}`;
//
//   return '/';
// };
//
// const getUrlPaged = (element, page, conn) =>
//   element.link ? `${getUrl(element, conn)}/page/${page}` : `${getUrl(element, conn)}&paged=${page}`;

export const requestHandlerCreator = ({ connection, history }) =>
  function* handleRequest({ selected, method, context }) {
    const { listType, listId, singleType, singleId, page } = selected;

    // get item
    const link = listType
      ? `/${listType}/${listId}/${page}/${context}`
      : `/${singleType}/${singleId}/${context}`;
    // : connection.connection.single[singleType][singleId].link;

    // debugger;

    if (['push', 'replace'].includes(method)) {
      yield call(() => history[method](
        // connection.context.getItem(selected).link.url,
        link,
        { selected, method, context },
      ));
    }
  };

// export const succeedHandlerCreator = ({ connection, history }) =>
//   function* handleRequest({ selected }) {
//     // yield call(() =>
//     // when(
//     //   () =>
//     //     isMatch(connection.selected, selected) && connection.selected.entity,
//     //   () => {
//     //     console.log('WOTOWOTOW');
//     //     const { state } = history.location;
//     //     const { page } = state;
//     //     const { entity } = connection.context.selected;
//     //     // history.replace(page ? getUrlPaged(entity, page) : getUrl(entity), state);
//     //     console.log(page ? getUrlPaged(entity, page) : getUrl(entity), state);
//     //   },
//     // );
//     // );
//
//     const { state } = history.location;
//     const { page } = state.selected;
//     const { entity } = connection.context.selected;
//     console.log(state, page, entity);
//
//     const sel = state.selected;
//
//     console.log(page && sel ? getUrlPaged(sel, page, connection) : getUrl(sel, connection), state);
//
//     yield call(() => console.log('SUCCEED'));
//   };

export default function* routerSaga(stores, history = createHistory()) {
  const { connection } = stores;
  const { type, id, listType, listId, singleType, singleId, page } = connection.selected;
  const context = connection.context.id;
  const { generator } = connection.context;
  history.replace(`/${type}/${id}/${page}/${context}`, {
    selected: { listType, listId, page, singleType, singleId },
    method: 'push',
    context: generator,
  });

  // Initializate router event channels.
  const routeChangedEvents = routeChanged(history);

  // Track router events and dispatch them to redux.
  yield takeEvery(routeChangedEvents, handleHistoryRouteChanges);
  yield takeEvery(
    actionTypes.ROUTE_CHANGE_REQUESTED,
    requestHandlerCreator({ connection, history }),
  );
  // yield takeEvery(actionTypes.ROUTE_CHANGE_SUCCEED, succeedHandlerCreator({ connection, history }));
}
