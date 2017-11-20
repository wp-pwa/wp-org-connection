import { getSnapshot } from 'mobx-state-tree';
import * as actionTypes from '../actionTypes';
import Connection from '../stores';

const connection = Connection.create({})

export default () => (state, { type, ...action }) => {
  switch (type) {
    case actionTypes.SINGLE_REQUESTED:
    case actionTypes.SINGLE_FAILED:
    case actionTypes.SINGLE_SUCCEED:
    case actionTypes.LIST_REQUESTED:
    case actionTypes.LIST_SUCCEED:
    case actionTypes.LIST_FAILED:
      connection[type](action)
      break;
    default:
      break;
  }
  return getSnapshot(connection);
}
