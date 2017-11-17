import { getSnapshot } from 'mobx-state-tree';
import uuid from 'uuid/v4';
import { Item } from '../item';
import Column from '../column';
import Context from '../context';
import Router from '../router';

const sampleStore = () => {

  const item1 = Item.create({
    id: uuid(),
    route: 'single',
    singleType: 'post',
    singleId: 1234,
    goBack: { id: uuid(), listType: 'latest' },
  });

  const item2 = Item.create({
    id: uuid(),
    route: 'list',
  });

  const item3 = Item.create({
    id: uuid(),
    route: 'list',
    listType: 'category',
    listId: 5,
    page: 1,
  });

  const item4 = Item.create({
    id: uuid(),
    route: 'list',
    listType: 'category',
    listId: 5,
    page: 2,
  });

  const col1 = Column.create({ id: uuid(), items: [item1], selected: item1 });
  const col2 = Column.create({ id: uuid(), items: [item2], selected: item2 });
  const col3 = Column.create({ id: uuid(), items: [item3, item4], selected: item4 });

  const ctx1 = Context.create({
    id: uuid(),
    selected: col1,
    columns: [col1, col2, col3],
  });

  return Router.create({
    context: ctx1,
    contexts: [ctx1],
  });
};

test('Router store should initiate empty', () => {
  const { contexts, context } = getSnapshot(Router.create({}));
  expect(contexts).toEqual([]);
  expect(context).toEqual(null);
});

test('Context is populated appropriately', () => {
  const store = sampleStore();

  expect(store.context.selected.selected.route).toBe('single');
  expect(store.context.selected.selected.singleType).toBe('post');
  expect(store.context.selected.selected.singleId).toBe(1234);
  expect(store.context.selected.selected.isReady).toBe(false);

  expect(store.context.columns[1].items[0].route).toBe('list');
  expect(store.context.columns[1].items[0].listType).toBe('latest');
  expect(store.context.columns[1].items[0].listId).toBe(0);
  expect(store.context.columns[1].items[0].singleType).toBe('post');
  expect(store.context.columns[1].items[0].isReady).toBe(false);

  expect(store.context.columns[2].items[1].route).toBe('list');
  expect(store.context.columns[2].items[1].listType).toBe('category');
  expect(store.context.columns[2].items[1].listId).toBe(5);
  expect(store.context.columns[2].items[1].singleType).toBe('post');
  expect(store.context.columns[2].items[1].isReady).toBe(false);
});

test('Case 1: Change route using push in current context', () => {
  const latest = { id: uuid(), route: 'list', listType: 'latest' };

  const post = (singleId, goBack) => ({
    id: uuid(),
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

  const col1 = Column.create({ id: uuid(), items: [post1], selected: post1 });
  const col2 = Column.create({ id: uuid(), items: [post2], selected: post2 });
  const col3 = Column.create({ id: uuid(), items: [post3], selected: post3 });
  const col4 = Column.create({ id: uuid(), items: [post4, post5], selected: post4 });

  const contextPosts = Context.create({
    id: uuid(),
    selected: col1,
    columns: [col1, col2, col3, col4],
    infinite: false,
    options: null,
  });

  const store = Router.create({
    context: contextPosts,
    contexts: [contextPosts],
  });



  expect(store.context.selected.selected.singleId).toBe(post1.singleId);
  expect(store.context.selected.selected.singleType).toBe('post');

  store.push({ selected: post(65, latest) });

  expect(store.context.selected.selected.singleId).toBe(post2.singleId);
  expect(store.context.selected.selected.singleType).toBe('post');

  store.push({ selected: post(70, latest) });

  expect(store.context.selected.selected.singleId).toBe(post3.singleId);
  expect(store.context.selected.selected.singleType).toBe('post');

  store.push({ selected: post(72, latest) });

  expect(store.context.selected.selected.singleId).toBe(post4.singleId);
  expect(store.context.selected.selected.singleType).toBe('post');

  store.push({ selected: post(75, latest) });

  expect(store.context.selected.selected.singleId).toBe(post5.singleId);
  expect(store.context.selected.selected.singleType).toBe('post');

  store.push({ selected: post(80, latest) });
  expect(store.contexts.length).toBe(2);
  expect(store.contexts[0].selected.singleId).toBe(post5.singleId);
  expect(store.context.selected.singleId).toBe(80);
  expect(store.context.selected.singleType).toBe('post');
});

test('Case 2: Change route using replace and overwriting context', () => {
  const latest = { id: 0, route: 'list', listType: 'latest' };
  const latest1 = { id: 1, route: 'list', listType: 'latest' };
  const list1 = { id: 2, route: 'list', listType: 'category', listId: 5 };
  const list2 = { id: 3, route: 'list', listType: 'category', listId: 6 };
  const list3 = { id: 4, route: 'list', listType: 'category', listId: 7 };

  const post = (singleId, goBack) => ({
    id: uuid(),
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
