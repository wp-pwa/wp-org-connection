export const typesToEndpoints = type => {
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

export const typesToParams = type => {
  const params = {
    category: 'categories',
    tag: 'tags',
    author: 'author',
  };
  return params[type] || type;
};
