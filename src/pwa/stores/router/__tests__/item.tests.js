import { Item } from '../item';
import Column from '../column';
import Connection from '../..';
import post60converted from '../../../__tests__/post-60-converted.json';

describe('Store > Context > Column > Item', () => {
  const post = Item.create({
    mstId: 'c0dab071-a251-4dac-9801-a2792a3bb362',
    type: 'post',
    id: 60,
    fromList: {
      mstId: 'e5571d38-b4c9-4c9e-bb7a-404954cad292',
      type: 'latest',
      id: 'post',
      page: 1,
    },
  });

  const page = Item.create({
    mstId: 'b783bfa6-9ff7-43dd-b7d3-8cf6d215ef7f',
    type: 'page',
    id: 30,
  });

  const latest = Item.create({
    mstId: 'c8bf4c53-370d-4e75-b023-917ec3a4a3b5',
    type: 'latest',
  });

  const category = Item.create({
    mstId: '2fbd1661-41fe-40d2-8df5-009f293ada41',
    type: 'category',
    listId: '12',
  });

  const column1 = Column.create({
    mstId: 'column-snapshot-000',
    selected: post,
    items: [post, category],
  });

  const column2 = Column.create({
    mstId: 'column-snapshot-001',
    selected: page,
    items: [page],
  });

  Connection.create({
    singleMap: {
      post: {
        60: post60converted,
      },
      category: {
        12: {
          id: 12,
          name: 'Category 12',
          slug: 'category12',
          taxonomy: 'category',
        },
      },
    },
    listMap: {
      category: {
        12: {
          total: {
            entities: 1,
            pages: 1,
          },
          pageMap: {
            0: {
              entities: [60],
            },
          },
        },
      },
    },
    contexts: [
      {
        index: 0,
        column: column1,
        columns: [column1, column2],
      },
    ],
  });

  test('props are populated appropriately', () => {
    expect(post).toMatchSnapshot();
    expect(page).toMatchSnapshot();
    expect(latest).toMatchSnapshot();
    expect(category).toMatchSnapshot();
  });

  test('single view', () => {
    expect(post.single).toMatchSnapshot();
    expect(category.single).toMatchSnapshot();
  });

  test('list view', () => {
    expect(category.list).toMatchSnapshot();
  });

  test('type and id', () => {
    expect(post.type).toBe('post');
    expect(parseInt(post.id, 10)).toBe(60);
    expect(category.type).toBe('category');
    expect(parseInt(category.id, 10)).toEqual(12);
    expect(latest.type).toBe('latest');
    expect(latest.id).toBe('post');
  });

  test('column', () => {
    expect(post.column).toMatchSnapshot();
    expect(page.column).toMatchSnapshot();
    expect(category.column).toMatchSnapshot();
    expect(latest.column).toBeNull();
  });

  test('next', () => {
    expect(post.next).toBe(category);
    expect(category.next).toBe(page);
    expect(page.next).toBeNull();
    expect(latest.next).toBeNull();
  });
});
