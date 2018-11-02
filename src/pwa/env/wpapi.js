import Wpapi from 'wpapi';
import forOwn from 'lodash/forOwn';

const typesToEndpoints = type => {
  const endpoints = {
    post: 'posts',
    page: 'pages',
    category: 'categories',
    tag: 'tags',
    author: 'users',
    media: 'media',
    comment: 'comments',
    taxonomy: 'taxonomies',
    postType: 'types',
    postStatus: 'statuses',
  };
  return endpoints[type] || type;
};

const typesToParams = type => {
  const params = {
    category: 'categories',
    tag: 'tags',
    author: 'author',
  };
  return params[type] || type;
};

const addParams = (query, params) => {
  let q = query;
  forOwn(params, (value, key) => {
    q = q.param(key, value);
  });
  return q;
};

class WpApi {
  api = null;
  queryParams = null;

  constructor({ cptEndpoints = {}, siteUrl, queryParams = {} }) {
    const apiUrl = `${siteUrl.replace(/\/$/, '')}/?rest_route=`;
    this.api = new Wpapi({ endpoint: apiUrl });
    this.queryParams = queryParams;
    Object.entries(cptEndpoints).forEach(([type, endpoint]) => {
      this.api[type] = this.api.registerRoute(
        'wp/v2',
        `/${endpoint}/(?P<id>\\d+)`,
      );
    });
  }

  getEntity({ type, id }) {
    const query = this.api[typesToEndpoints(type)]()
      .id(id)
      .embed();

    return addParams(query, this.queryParams);
  }

  getListPage({ type, id, page = 1, perPage = 10 }) {
    const endpoint =
      type === 'latest' ? typesToEndpoints(id) : typesToEndpoints('post');
    const query = this.api[endpoint]().page(page);
    const params = { _embed: true, per_page: perPage, ...this.queryParams };
    if (['category', 'tag', 'author'].includes(type)) {
      params[typesToParams(type)] = id;
    }

    return addParams(query, params);
  }

  getCustomPage({ type, page = 1, params = {} }) {
    const query = this.api[typesToEndpoints(type)]()
      .page(page)
      .embed();

    return addParams(query, { ...params, ...this.queryParams });
  }
}

export default WpApi;
