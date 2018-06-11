import Wpapi from 'wpapi';
import forOwn from 'lodash/forOwn';

let api = null;

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

class WpApi {
  api = null

  constructor({ cptEndpoints = {}, siteUrl }) {
    const apiUrl = `${siteUrl.replace(/\/$/, '')}/?rest_route=`;
    this.api = new Wpapi({ endpoint: apiUrl });
    Object.entries(cptEndpoints).forEach(([type, endpoint]) => {
      this.api[type] = this.api.registerRoute('wp/v2', `/${endpoint}/(?P<id>\\d+)`);
    });
  }

  getEntity({ type, id }){
    return this.api[typesToEndpoints(type)]()
    .id(id)
    .embed()
  }

  getListPage({ type, id, page = 1, perPage = 10 }) {
    const endpoint = type === 'latest' ? typesToEndpoints(id) : typesToEndpoints('post');
    const params = { _embed: true, per_page: perPage };
    if (['category', 'tag', 'author'].includes(type)) {
      params[typesToParams(type)] = id;
    }
    let query = this.api[endpoint]().page(page);
    forOwn(params, (value, key) => {
      query = query.param(key, value);
    });
    return query;
  }

  getCustomPage({ type, page = 1, params = {} }) {
    let query = this.api[typesToEndpoints(type)]()
      .page(page)
      .embed();
    forOwn(params, (value, key) => {
      query = query.param(key, value);
    });
    return query;
  }
}

export default WpApi;
