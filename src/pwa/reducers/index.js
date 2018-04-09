import { applySnapshot, getSnapshot } from 'mobx-state-tree';

export default store => {
  let firstTime = true;
  return (state, action) => {
    if (state !== undefined && firstTime) {
      applySnapshot(store, state);
      firstTime = false;
    }
    store.setLastAction({ action });
    return getSnapshot(store);
  };
};
