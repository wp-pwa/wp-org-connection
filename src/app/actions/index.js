import { flow, mapValues, mapKeys } from 'lodash/fp';
import * as types from '../types';

const wpTypes = {
  posts: 'POSTS',
  pages: 'PAGES',
  categories: 'CATEGORIES',
  tags: 'TAGS',
  users: 'USERS',
  media: 'MEDIA',
  comments: 'COMMENTS',
  taxonomies: 'TAXONOMIES',
  postTypes: 'POST_TYPES',
  postStatuses: 'POST_STATUSES',
};

const paramsChange = flow(
  mapValues(value =>
    ({ params = {} } = {}) => ({ type: types[`${value}_PARAMS_CHANGED`], params })),
  mapKeys(key => `${key}ParamsChanged`),
)(wpTypes);

const newListRequested = flow(
  mapValues(value =>
    ({ params = {}, name = 'current' } = {}) =>
      ({ type: types[`NEW_${value}_LIST_REQUESTED`], params, name })),
  mapKeys(key => `new${key.charAt(0).toUpperCase()}${key.slice(1)}ListRequested`),
)(wpTypes);

const newListSucceed = flow(
  mapValues(value =>
    ({ params, entities, result, key, wpType, name }) =>
      ({ type: types[`NEW_${value}_LIST_SUCCEED`], params, entities, result, key, wpType, name })),
  mapKeys(key => `new${key.charAt(0).toUpperCase()}${key.slice(1)}ListSucceed`),
)(wpTypes);

const newListFailed = flow(
  mapValues(value =>
    ({ params, error, endpoint, name }) =>
      ({ type: types[`NEW_${value}_LIST_FAILED`], params, error, endpoint, name })),
  mapKeys(key => `new${key.charAt(0).toUpperCase()}${key.slice(1)}ListFailed`),
)(wpTypes);

module.exports = { ...newListFailed };
// export const postsListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.POSTS_LIST_REQUESTED, params, page, name });
// export const postsListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.POSTS_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const postsListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.POSTS_LIST_FAILED, params, error, endpoint, name });
// export const postRequested = ({ id }) => ({ type: types.POST_REQUESTED, id });
// export const postSucceed = ({ id, post }) => ({ type: types.POST_SUCCEED, id, post });
// export const postFailed = ({ id, error, endpoint }) =>
//   ({ type: types.POST_FAILED, id, error, endpoint });
//
// export const pagesListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.PAGES_LIST_REQUESTED, params, page, name });
// export const pagesListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.PAGES_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const pagesListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.PAGES_LIST_FAILED, params, error, endpoint, name });
// export const pageRequested = ({ id }) => ({ type: types.PAGE_REQUESTED, id });
// export const pageSucceed = ({ id, page }) => ({ type: types.PAGE_SUCCEED, id, page });
// export const pageFailed = ({ id, error, endpoint }) =>
//   ({ type: types.PAGE_FAILED, id, error, endpoint });
//
// export const tagsListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.TAGS_LIST_REQUESTED, params, page, name });
// export const tagsListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.TAGS_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const tagsListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.TAGS_LIST_FAILED, params, error, endpoint, name });
// export const tagRequested = ({ id }) => ({ type: types.TAG_REQUESTED, id });
// export const tagSucceed = ({ id, tag }) => ({ type: types.TAG_SUCCEED, id, tag });
// export const tagFailed = ({ id, error, endpoint }) =>
//   ({ type: types.TAG_FAILED, id, error, endpoint });
//
// export const usersListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.USERS_LIST_REQUESTED, params, page, name });
// export const usersListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.USERS_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const usersListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.USERS_LIST_FAILED, params, error, endpoint, name });
// export const userRequested = ({ id }) => ({ type: types.USER_REQUESTED, id });
// export const userSucceed = ({ id, user }) => ({ type: types.USER_SUCCEED, id, user });
// export const userFailed = ({ id, error, endpoint }) =>
//   ({ type: types.USER_FAILED, id, error, endpoint });
//
// export const mediaListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.MEDIA_LIST_REQUESTED, params, page, name });
// export const mediaListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.MEDIA_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const mediaListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.MEDIA_LIST_FAILED, params, error, endpoint, name });
// export const mediaRequested = ({ id }) => ({ type: types.MEDIA_REQUESTED, id });
// export const mediaSucceed = ({ id, media }) => ({ type: types.MEDIA_SUCCEED, id, media });
// export const mediaFailed = ({ id, error, endpoint }) =>
//   ({ type: types.MEDIA_FAILED, id, error, endpoint });
//
// export const categoriesListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.CATEGORIES_LIST_REQUESTED, params, page, name });
// export const categoriesListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.CATEGORIES_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const categoriesListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.CATEGORIES_LIST_FAILED, params, error, endpoint, name });
// export const categoryRequested = ({ id }) => ({ type: types.CATEGORY_REQUESTED, id });
// export const categorySucceed = ({ id, category }) =>
//   ({ type: types.CATEGORY_SUCCEED, id, category });
// export const categoryFailed = ({ id, error, endpoint }) =>
//   ({ type: types.CATEGORY_FAILED, id, error, endpoint });
//
// export const commentsListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.COMMENTS_LIST_REQUESTED, params, page, name });
// export const commentsListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.COMMENTS_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const commentsListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.COMMENTS_LIST_FAILED, params, error, endpoint, name });
// export const commentRequested = ({ id }) => ({ type: types.COMMENT_REQUESTED, id });
// export const commentSucceed = ({ id, comment }) => ({ type: types.COMMENT_SUCCEED, id, comment });
// export const commentFailed = ({ id, error, endpoint }) =>
//   ({ type: types.COMMENT_FAILED, id, error, endpoint });
//
// export const taxonomiesListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.TAXONOMIES_LIST_REQUESTED, params, page, name });
// export const taxonomiesListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.TAXONOMIES_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const taxonomiesListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.TAXONOMIES_LIST_FAILED, params, error, endpoint, name });
// export const taxonomyRequested = ({ id }) => ({ type: types.TAXONOMY_REQUESTED, id });
// export const taxonomySucceed = ({ id, taxonomy }) =>
//   ({ type: types.TAXONOMY_SUCCEED, id, taxonomy });
// export const taxonomyFailed = ({ id, error, endpoint }) =>
//   ({ type: types.TAXONOMY_FAILED, id, error, endpoint });
//
// export const postTypesListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.POST_TYPES_LIST_REQUESTED, params, page, name });
// export const postTypesListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.POST_TYPES_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const postTypesListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.POST_TYPES_LIST_FAILED, params, error, endpoint, name });
// export const postTypeRequested = ({ id }) => ({ type: types.POST_TYPE_REQUESTED, id });
// export const postTypeSucceed = ({ id, postType }) =>
//   ({ type: types.POST_TYPE_SUCCEED, id, postType });
// export const postTypeFailed = ({ id, error, endpoint }) =>
//   ({ type: types.POST_TYPE_FAILED, id, error, endpoint });
//
// export const postStatusesListRequested = ({ params = {}, page = 1, name = 'current' } = {}) =>
//   ({ type: types.POST_STATUSES_LIST_REQUESTED, params, page, name });
// export const postStatusesListSucceed = ({ params, entities, result, key, page, wpType, name }) =>
//   ({ type: types.POST_STATUSES_LIST_SUCCEED, params, entities, result, key, page, wpType, name });
// export const postStatusesListFailed = ({ params, error, endpoint, name }) =>
//   ({ type: types.POST_STATUSES_LIST_FAILED, params, error, endpoint, name });
// export const postStatusRequested = ({ id }) => ({ type: types.POST_STATUS_REQUESTED, id });
// export const postStatusSucceed = ({ id, postStatus }) =>
//   ({ type: types.POST_STATUS_SUCCEED, id, postStatus });
// export const postStatusFailed = ({ id, error, endpoint }) =>
//   ({ type: types.POST_STATUS_FAILED, id, error, endpoint });
