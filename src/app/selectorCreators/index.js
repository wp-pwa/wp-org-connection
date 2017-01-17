export const getPostById = id => state => state.connection.posts.entities.posts[id];
export const getTagById = id => state => state.connection.posts.entities.tags[id];
export const getAuthorById = id => state => state.connection.posts.entities.author[id];
export const getFeaturedMediaById = id =>
  state => state.connection.posts.entities.featured_media[id];
export const getCategoryById = id => state => state.connection.categories.entities.category[id];
