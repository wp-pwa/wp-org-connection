import * as actionTypes from '../actionTypes';

export const singleRequested = ({ singleType, singleId }) => ({
  type: actionTypes.SINGLE_REQUESTED,
  singleType,
  singleId,
});

export const singleSucceed = ({ entity }) => ({
  type: actionTypes.SINGLE_SUCCEED,
  entity,
});
export const singleFailed = ({ singleType, singleId, error }) => ({
  type: actionTypes.SINGLE_FAILED,
  singleType,
  singleId,
  error,
});

export const listRequested = ({ listType, listId, page }) => ({
  type: actionTypes.LIST_REQUESTED,
  listType,
  listId,
  page,
});
export const listSucceed = ({ listType, listId, page, total, results, entities }) => ({
  type: actionTypes.LIST_SUCCEED,
  listType,
  listId,
  page,
  total,
  results,
  entities,
});
export const listFailed = ({ listType, listId, page, error }) => ({
  type: actionTypes.LIST_FAILED,
  listType,
  listId,
  page,
  error,
});

export const customListRequested = () => ({
  type: actionTypes.CUSTOM_LIST_REQUESTED,
});
export const customListSucceed = () => ({
  type: actionTypes.CUSTOM_LIST_SUCCEED,
});
export const customListFailed = () => ({
  type: actionTypes.CUSTOM_LIST_FAILED,
});

export const routeChangeRequested = () => ({
  type: actionTypes.ROUTE_CHANGE_REQUESTED,
});
export const routeChangeSucceed = () => ({
  type: actionTypes.ROUTE_CHANGE_SUCCEED,
});
export const routeChangeFailed = () => ({
  type: actionTypes.ROUTE_CHANGE_FAILED,
});
