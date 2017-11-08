import { getSnapshot } from 'mobx-state-tree';
import { Router, Context, Item } from '../router';



function router(initialState, action, payload) {
  const store = Router.create({ ...initialState });
  if (action) store[action](payload);
  return getSnapshot(store);
}

test('Router store should initiate empty', () => {
  const { contexts, activeContext, selected } = router();
  expect(contexts).toEqual([]);
  expect(activeContext).toEqual(null);
  expect(selected).toEqual(null);
});

test('Context is populated appropriately', () => {

  const selected = {
    route: 'single',
    singleType: 'post',
    singleId: 123,
  };

  const activeContext = {
    selected,
    items: [ selected ],
    infinite: false,
    options: null,
  };

  const store = Router.create({
    activeContext,
    contexts: [
      activeContext
    ],
    selected: null,
  });

  expect(store.activeContext).toEqual(activeContext);
});
