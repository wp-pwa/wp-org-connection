import * as types from '../types';

export const singleRequested = () => ({
  type: types.SINGLE_REQUESTED,
});
export const singleSucceed = () => ({
  type: types.SINGLE_SUCCEED,
});
export const singleFailed = () => ({
  type: types.SINGLE_FAILED,
});

export const listRequested = () => ({
  type: types.LIST_REQUESTED,
});
export const listSucceed = () => ({
  type: types.LIST_SUCCEED,
});
export const listFailed = () => ({
  type: types.LIST_FAILED,
});

export const customListRequested = () => ({
  type: types.CUSTOM_LIST_REQUESTED,
});
export const customListSucceed = () => ({
  type: types.CUSTOM_LIST_SUCCEED,
});
export const customListFailed = () => ({
  type: types.CUSTOM_LIST_FAILED,
});

export const routeChangeRequested = () => ({
  type: types.ROUTE_CHANGE_REQUESTED,
});
export const routeChangeSucceed = () => ({
  type: types.ROUTE_CHANGE_SUCCEED,
});
export const routeChangeFailed = () => ({
  type: types.ROUTE_CHANGE_FAILED,
});
