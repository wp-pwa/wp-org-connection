import { flatten } from 'lodash';

export const getParams = type => state => state.connection.params[type];

export const getPostsById = id => state => state.connection.entities.posts[id];
export const getPagesById = id => state => state.connection.entities.pages[id];
export const getTagsById = id => state => state.connection.entities.tags[id];
export const getUsersById = id => state => state.connection.entities.users[id];
export const getMediaById = id => state => state.connection.entities.media[id];
export const getCategoriesById = id => state => state.connection.entities.categories[id];
export const getCommentsById = id => state => state.connection.entities.comments[id];
export const getTaxonomiesById = id => state => state.connection.entities.taxonomies[id];
export const getPostTypesById = id => state => state.connection.entities.postTypes[id];
export const getPostStatusesById = id => state => state.connection.entities.postStatuses[id];

export const getListResults = name => state => {
  const key = state.connection.names[name].key;
  const wpType = state.connection.names[name].wpType;
  return flatten(state.connection.results[wpType][key]);
};

export const getListPageResults = (name, page) => state => {
  const key = state.connection.names[name].key;
  const wpType = state.connection.names[name].wpType;
  return state.connection.results[wpType][key][page - 1] || [];
};

export const getListNumberOfPages = name => state => {
  const key = state.connection.names[name].key;
  const wpType = state.connection.names[name].wpType;
  return state.connection.results[wpType][key].length;
};

export const getListParams = name =>
  state => state.connection.names[name] && state.connection.names[name].params;

export const isListInitialisated = name =>
  state => typeof state.connection.names[name] !== 'undefined';
