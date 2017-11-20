import * as actionTypes from '../actionTypes';

export const singleRequested = ({ singleType, singleId }) => ({
  type: actionTypes.SINGLE_REQUESTED,
  singleType,
  singleId,
});
export const singleSucceed = ({ singleType, singleId, entities }) => ({
  type: actionTypes.SINGLE_SUCCEED,
  singleType,
  singleId,
  entities,
});
export const singleFailed = ({ singleType, singleId, error, endpoint }) => ({
  type: actionTypes.SINGLE_FAILED,
  singleType,
  singleId,
  error,
  endpoint,
});

export const listRequested = ({ listType, listId, page = 1 }) => ({
  type: actionTypes.LIST_REQUESTED,
  listType,
  listId,
  page,
});
export const listSucceed = ({
  listType,
  listId = null,
  page = 1,
  total = { entities: 0, pages: 0 },
  result,
  entities,
}) => ({
  type: actionTypes.LIST_SUCCEED,
  listType,
  listId,
  page,
  total,
  result,
  entities,
});
export const listFailed = ({ listType, listId, page, error, endpoint }) => ({
  type: actionTypes.LIST_FAILED,
  listType,
  listId,
  page,
  error,
  endpoint,
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
