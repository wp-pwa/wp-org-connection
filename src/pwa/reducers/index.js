import { applySnapshot, getSnapshot } from 'mobx-state-tree';
import * as actionTypes from '../actionTypes';

export default store => {
  let firstTime = true;
  return (state, { type, ...action }) => {
    if (state !== undefined && firstTime) {
      applySnapshot(store, state);
      firstTime = false;
    }
    switch (type) {
      case actionTypes.SINGLE_REQUESTED:
      case actionTypes.SINGLE_FAILED:
      case actionTypes.SINGLE_SUCCEED:
      case actionTypes.LIST_REQUESTED:
      case actionTypes.LIST_SUCCEED:
      case actionTypes.LIST_FAILED:
      case actionTypes.CUSTOM_REQUESTED:
      case actionTypes.CUSTOM_SUCCEED:
      case actionTypes.CUSTOM_FAILED:
      case actionTypes.ROUTE_CHANGE_SUCCEED:
      case actionTypes.HEAD_CONTENT_SUCCEED:
        store[type](action);
        break;
      default:
        break;
    }
    return getSnapshot(store);
  };
};
