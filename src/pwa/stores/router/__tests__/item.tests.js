import { Item } from '../item';

describe('Router > Context > Column > Item', () => {
  test('Item props are populated appropriately', () => {
    const post = Item.create({
      _id: 'c0dab071-a251-4dac-9801-a2792a3bb362',
      route: 'single',
      singleType: 'post',
      singleId: 60,
      fromList: {
        _id: 'e5571d38-b4c9-4c9e-bb7a-404954cad292',
        listType: 'latest',
      },
    });

    const page = Item.create({
      _id: 'b783bfa6-9ff7-43dd-b7d3-8cf6d215ef7f',
      route: 'single',
      singleType: 'page',
      singleId: 30,
      fromList: {
        _id: '7ee66289-df96-4b2b-a08b-5527cacfc266',
        listType: 'latest',
      },
    });

    const latest = Item.create({
      _id: 'c8bf4c53-370d-4e75-b023-917ec3a4a3b5',
      listType: 'latest',
    });

    const category = Item.create({
      _id: '2fbd1661-41fe-40d2-8df5-009f293ada41',
      listType: 'category',
      listId: '12',
    });

    expect(post).toMatchSnapshot();
    expect(page).toMatchSnapshot();
    expect(latest).toMatchSnapshot();
    expect(category).toMatchSnapshot();
  });
});
