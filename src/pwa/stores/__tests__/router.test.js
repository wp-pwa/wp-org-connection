import { getSnapshot } from 'mobx-state-tree';
import { Router, Item, generateId } from '../router';

const sampleStore = () =>
  Router.create({
    activeContext: 333,
    contexts: [
      {
        id: 333,
        selected: 123,
        items: [
          {
            id: 123,
            route: 'single',
            singleType: 'post',
            singleId: 1234,
            goBack: { id: 0, listType: 'latest' },
          },
          {
            id: 124,
            route: 'list',
          },
          [
            {
              id: 125,
              route: 'list',
              listType: 'category',
              listId: 5,
              page: 1,
            },
            {
              id: 126,
              route: 'list',
              listType: 'category',
              listId: 5,
              page: 2,
            },
          ],
        ],
        infinite: false,
        options: null,
      },
    ],
  });

test('Router store should initiate empty', () => {
  const { contexts, activeContext } = getSnapshot(Router.create({}));
  expect(contexts).toEqual([]);
  expect(activeContext).toEqual(null);
});

test('An item of type Single is populated appropriately', () => {
  const item = Item.create({
    id: 123,
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    goBack: { id: 0, listType: 'latest' },
  });
  expect(getSnapshot(item)).toEqual({
    id: 123,
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    isReady: false,
    goBack: {
      id: 0,
      isReady: false,
      listId: 0,
      listType: 'latest',
      page: 0,
      route: 'list',
      singleType: 'post',
    },
  });
});

test('An item of type List is populated appropriately', () => {
  const item = Item.create({
    id: 124,
    route: 'list',
  });
  expect(getSnapshot(item)).toEqual({
    id: 124,
    isReady: false,
    listId: 0,
    listType: 'latest',
    page: 0,
    route: 'list',
    singleType: 'post',
  });
});

test('Context is populated appropriately', () => {
  const store = sampleStore();

  expect(store.activeContext.selected.route).toBe('single');
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.selected.singleId).toBe(1234);
  expect(store.activeContext.selected.isReady).toBe(false);

  expect(store.activeContext.items[1].route).toBe('list');
  expect(store.activeContext.items[1].listType).toBe('latest');
  expect(store.activeContext.items[1].listId).toBe(0);
  expect(store.activeContext.items[1].singleType).toBe('post');
  expect(store.activeContext.items[1].isReady).toBe(false);

  expect(store.activeContext.items[2][1].route).toBe('list');
  expect(store.activeContext.items[2][1].listType).toBe('category');
  expect(store.activeContext.items[2][1].listId).toBe(5);
  expect(store.activeContext.items[2][1].singleType).toBe('post');
  expect(store.activeContext.items[2][1].isReady).toBe(false);
});

test('findIndex should return the correct position of an element inside context', () => {
  const store = sampleStore();

  expect(
    store.activeContext.findIndex({
      singleType: 'post',
      singleId: 1234,
    }),
  ).toEqual({ x: 0, y: 0 });

  expect(
    store.activeContext.findIndex({
      singleType: 'post',
      singleId: 'asdfasd',
    }),
  ).toEqual({ x: -1, y: -1 });

  expect(
    store.activeContext.findIndex({
      listType: 'category',
      listId: 5,
      page: 1,
    }),
  ).toEqual({ x: 2, y: 0 });

  expect(
    store.activeContext.findIndex({
      listType: 'category',
      listId: 5,
      page: 2,
    }),
  ).toEqual({ x: 2, y: 1 });

  expect(
    store.activeContext.findIndex({
      listType: 'category',
      listId: 5,
      page: 3,
    }),
  ).toEqual({ x: -1, y: -1 });
});

test('Changing selected in a context works as expected', () => {
  const store = sampleStore();

  store.activeContext.setSelected({ x: 2, y: 1 });

  expect(store.activeContext.selected.listType).toBe('category');
  expect(store.activeContext.selected.listId).toBe(5);
  expect(store.activeContext.selected.page).toBe(2);
});

test('Case 1: Change route using push in current context', () => {
  const latest = { id: 0, route: 'list', listType: 'latest' };

  const post = (singleId, goBack) => ({
    id: generateId(),
    route: 'single',
    singleType: 'post',
    singleId,
    goBack,
  });

  const post1 = Item.create(post(64, latest));
  const post2 = Item.create(post(65, latest));
  const post3 = Item.create(post(70, latest));
  const post4 = Item.create(post(72, latest));
  const post5 = Item.create(post(75, latest));

  const contextPosts = {
    id: 0,
    selected: post1.id,
    items: [post1, post2, post3, [post4, post5]],
    infinite: false,
    options: null,
  };

  const store = Router.create({
    activeContext: contextPosts.id,
    contexts: [contextPosts],
  });

  expect(store.activeContext.selected.singleId).toBe(post1.singleId);
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.getPrevious()).toBe(null);
  expect(store.activeContext.getCurrent().singleId).toBe(post1.singleId);
  expect(store.activeContext.getNext().singleId).toBe(post2.singleId);

  store.push({ selected: post(65, latest) });

  expect(store.activeContext.selected.singleId).toBe(post2.singleId);
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.getPrevious().singleId).toBe(post1.singleId);
  expect(store.activeContext.getCurrent().singleId).toBe(post2.singleId);
  expect(store.activeContext.getNext().singleId).toBe(post3.singleId);

  store.push({ selected: post(70, latest) });

  expect(store.activeContext.selected.singleId).toBe(post3.singleId);
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.getPrevious().singleId).toBe(post2.singleId);
  expect(store.activeContext.getCurrent().singleId).toBe(post3.singleId);
  expect(store.activeContext.getNext()[0].singleId).toBe(post4.singleId);
  expect(store.activeContext.getNext()[1].singleId).toBe(post5.singleId);

  store.push({ selected: post(72, latest) });

  expect(store.activeContext.selected.singleId).toBe(post4.singleId);
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.getPrevious().singleId).toBe(post3.singleId);
  expect(store.activeContext.getCurrent()[0].singleId).toBe(post4.singleId);
  expect(store.activeContext.getCurrent()[1].singleId).toBe(post5.singleId);
  expect(store.activeContext.getNext()).toBe(null);

  store.push({ selected: post(75, latest) });

  expect(store.activeContext.selected.singleId).toBe(post5.singleId);
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.getPrevious().singleId).toBe(post3.singleId);
  expect(store.activeContext.getCurrent()[0].singleId).toBe(post4.singleId);
  expect(store.activeContext.getCurrent()[1].singleId).toBe(post5.singleId);
  expect(store.activeContext.getNext()).toBe(null);

  store.push({ selected: post(80, latest) });
  expect(store.contexts.length).toBe(2);
  expect(store.contexts[0].selected.singleId).toBe(post5.singleId);
  expect(store.activeContext.selected.singleId).toBe(80);
  expect(store.activeContext.selected.singleType).toBe('post');
  expect(store.activeContext.getPrevious()).toBe(null);
  expect(store.activeContext.getCurrent().singleId).toBe(80);
  expect(store.activeContext.getNext()).toBe(null);
});

test('Case 2: Change route using replace and overwriting context', () => {
  const latest = { id: 0, route: 'list', listType: 'latest' };
  const latest1 = { id: 1, route: 'list', listType: 'latest' };
  const list1 = { id: 2, route: 'list', listType: 'category', listId: 5 };
  const list2 = { id: 3, route: 'list', listType: 'category', listId: 6 };
  const list3 = { id: 4, route: 'list', listType: 'category', listId: 7 };

  const post = (singleId, goBack) => ({
    id: generateId(),
    route: 'single',
    singleType: 'post',
    singleId,
    goBack,
  });

  const post1 = Item.create(post(64, latest));
  const post11 = Item.create(post(64, latest));
  const post2 = Item.create(post(65, latest));
  const post3 = Item.create(post(70, latest));
  const post4 = Item.create(post(72, latest));

  const contextPosts = {
    id: 0,
    selected: post1.id,
    items: [[post1, latest], post2, post3, post4],
    infinite: false,
    options: null,
  };

  const contextLists = {
    id: 1,
    selected: latest1.id,
    items: [[post11, latest1], list1, list2, list3],
    infinite: false,
    options: null,
  };

  const store = Router.create({
    activeContext: contextPosts.id,
    contexts: [contextPosts],
  });

  expect(store.activeContext.selected.id).toBe(post1.id);
  expect(store.activeContext.items[1].singleType).toBe('post');

  store.replace({ context: contextLists });

  console.log(getSnapshot(store.activeContext.items[0][1]));

  expect(store.activeContext.items[0][1].listType).toBe('latest');
  expect(store.activeContext.findIndex({ listType: 'latest' })).toEqual({ x: 0, y: 1 });
  expect(store.activeContext.items[1].listType).toBe('category');

  store.replace({ selected: list1 });
  console.log(store.activeContext.items);

  expect(store.activeContext.items[0][2].listType).toBe('category');
  expect(store.activeContext.items[0][2].listId).toBe('5');
  expect(store.activeContext.items[1].listType).toBe('category');
  expect(store.activeContext.items[1].listId).toBe('6');
});
