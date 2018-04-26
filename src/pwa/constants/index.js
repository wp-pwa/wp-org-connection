

export const typesToParams = type => {
  const params = {
    category: 'categories',
    tag: 'tags',
    author: 'author',
  };
  return params[type] || type;
};
