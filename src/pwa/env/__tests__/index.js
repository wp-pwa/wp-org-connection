import env from '..';

const { connection } = env;

describe('Connection › WpApi', () => {
  test('should init without throwing', async () => {
    expect(() => connection.init({ siteUrl: 'https://example.com' })).not.toThrow();
  });
  test('should throw if no url is present', async () => {
    expect(() => connection.init()).toThrow();
  });
  test('should build correct urls for getEntity', async () => {
    connection.init({ siteUrl: 'https://example.com' });
    expect(connection.getEntity({ type: 'post', id: 60 }).toString()).toMatchSnapshot();
    expect(connection.getEntity({ type: 'media', id: 62 }).toString()).toMatchSnapshot();
    expect(connection.getEntity({ type: 'category', id: 7 }).toString()).toMatchSnapshot();
    expect(connection.getEntity({ type: 'tag', id: 10 }).toString()).toMatchSnapshot();
    expect(connection.getEntity({ type: 'page', id: 3 }).toString()).toMatchSnapshot();
  });
  test('should build correct urls for getEntity using custom post types', async () => {
    connection.init({
      siteUrl: 'https://example.com',
      cptEndpoints: {
        session: 'sessions',
        speaker: 'speakers',
      },
    });
    expect(connection.getEntity({ type: 'session', id: 60 }).toString()).toMatchSnapshot();
    expect(connection.getEntity({ type: 'speaker', id: 62 }).toString()).toMatchSnapshot();
  });
  test('should throw if custom post type is not registered', async () => {
    connection.init({ siteUrl: 'https://example.com' });
    expect(() => connection.getEntity({ type: 'session', id: 60 }).toString()).toThrow();
  });
  test('should build correct urls for getListPage', async () => {
    connection.init({ siteUrl: 'https://example.com' });
    expect(
      connection.getListPage({ type: 'latest', id: 'post' }).toString(),
    ).toMatchSnapshot();
    expect(
      connection.getListPage({ type: 'latest', id: 'post', page: 2 }).toString(),
    ).toMatchSnapshot();
    expect(
      connection.getListPage({ type: 'category', id: 7, page: 3, perPage: 5 }).toString(),
    ).toMatchSnapshot();
    expect(
      connection.getListPage({ type: 'tag', id: 10, page: 10, perPage: 3 }).toString(),
    ).toMatchSnapshot();
  });
  test('should build correct urls for getCustom', async () => {
    connection.init({ siteUrl: 'https://example.com' });
    expect(
      connection.getCustom({ type: 'post' }).toString(),
    ).toMatchSnapshot();
    expect(
      connection.getCustom({ type: 'category', params: { includes: 7 }, page: 2 }).toString(),
    ).toMatchSnapshot();
    expect(
      connection.getCustom({ type: 'page', params: { includes: '3,4' }, page: 1 }).toString(),
    ).toMatchSnapshot();
  });
});
