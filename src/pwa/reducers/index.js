import { getSnapshot } from 'mobx-state-tree';
import * as actionTypes from '../actionTypes';
import Connection from '../stores';

export const store = Connection.create({})

export const reducers = () => (state, { type, ...action }) => {
  switch (type) {
    case actionTypes.SINGLE_REQUESTED:
    case actionTypes.SINGLE_FAILED:
    case actionTypes.SINGLE_SUCCEED:
    case actionTypes.LIST_REQUESTED:
    case actionTypes.LIST_SUCCEED:
    case actionTypes.LIST_FAILED:
      store[type](action)
      break;
    default:
      break;
  }
  return getSnapshot(store);
}
