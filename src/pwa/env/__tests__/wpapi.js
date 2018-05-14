import wpapi from '../wpapi';

describe('Connection › WpApi', () => {
  test('should init without throwing', async () => {
    expect(() => wpapi.init({ siteUrl: 'https://example.com' })).not.toThrow();
  });
  test('should throw if no url is present', async () => {
    expect(() => wpapi.init()).toThrow();
  });
  test('should build correct urls for getEntity', async () => {
    wpapi.init({ siteUrl: 'https://example.com' });
    expect(wpapi.getEntity({ type: 'post', id: 60 }).toString()).toMatchSnapshot();
    expect(wpapi.getEntity({ type: 'media', id: 62 }).toString()).toMatchSnapshot();
    expect(wpapi.getEntity({ type: 'category', id: 7 }).toString()).toMatchSnapshot();
    expect(wpapi.getEntity({ type: 'tag', id: 10 }).toString()).toMatchSnapshot();
    expect(wpapi.getEntity({ type: 'page', id: 3 }).toString()).toMatchSnapshot();
  });
  test('should build correct urls for getEntity using custom post types', async () => {
    wpapi.init({
      siteUrl: 'https://example.com',
      cptEndpoints: {
        session: 'sessions',
        speaker: 'speakers',
      },
    });
    expect(wpapi.getEntity({ type: 'session', id: 60 }).toString()).toMatchSnapshot();
    expect(wpapi.getEntity({ type: 'speaker', id: 62 }).toString()).toMatchSnapshot();
  });
  test('should throw if custom post type is not registered', async () => {
    wpapi.init({ siteUrl: 'https://example.com' });
    expect(() => wpapi.getEntity({ type: 'session', id: 60 }).toString()).toThrow();
  });
  test('should build correct urls for getListPage', async () => {
    wpapi.init({ siteUrl: 'https://example.com' });
    expect(
      wpapi.getListPage({ type: 'latest', id: 'post' }).toString(),
    ).toMatchSnapshot();
    expect(
      wpapi.getListPage({ type: 'latest', id: 'post', page: 2 }).toString(),
    ).toMatchSnapshot();
    expect(
      wpapi.getListPage({ type: 'category', id: 7, page: 3, perPage: 5 }).toString(),
    ).toMatchSnapshot();
    expect(
      wpapi.getListPage({ type: 'tag', id: 10, page: 10, perPage: 3 }).toString(),
    ).toMatchSnapshot();
  });
  test('should build correct urls for getCustom', async () => {
    wpapi.init({ siteUrl: 'https://example.com' });
    expect(
      wpapi.getCustom({ type: 'post' }).toString(),
    ).toMatchSnapshot();
    expect(
      wpapi.getCustom({ type: 'category', params: { includes: 7 }, page: 2 }).toString(),
    ).toMatchSnapshot();
    expect(
      wpapi.getCustom({ type: 'page', params: { includes: '3,4' }, page: 1 }).toString(),
    ).toMatchSnapshot();
  });
});
