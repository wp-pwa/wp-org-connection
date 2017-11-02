import * as types from '../types';

export const routeChangeRequested = ({ currentType, currentId, currentList = 'currentList' }) => ({
  type: types.ROUTE_CHANGE_REQUESTED,
  currentType,
  currentId,
  currentList,
});
export const routeChangeSucceed = ({
  pathname,
  currentType,
  currentId,
  currentList = 'currentList',
}) => ({
  type: types.ROUTE_CHANGE_SUCCEED,
  pathname,
  currentType,
  currentId,
  currentList,
});
