import * as types from '../types';

export const postsParamsChanged = ({ params }) => ({ type: types.POSTS_PARAMS_CHANGED, params });
export const pagesParamsChanged = ({ params }) => ({ type: types.PAGES_PARAMS_CHANGED, params });
export const tagsParamsChanged = ({ params }) => ({ type: types.TAGS_PARAMS_CHANGED, params });
export const usersParamsChanged = ({ params }) => ({ type: types.USERS_PARAMS_CHANGED, params });
export const mediaParamsChanged = ({ params }) => ({ type: types.MEDIA_PARAMS_CHANGED, params });
export const categoriesParamsChanged = ({ params }) =>
  ({ type: types.CATEGORIES_PARAMS_CHANGED, params });
export const commentsParamsChanged = ({ params }) =>
  ({ type: types.COMMENTS_PARAMS_CHANGED, params });
export const taxonomiesParamsChanged = ({ params }) =>
  ({ type: types.TAXONOMIES_PARAMS_CHANGED, params });
export const postTypesParamsChanged = ({ params }) =>
  ({ type: types.POST_TYPES_PARAMS_CHANGED, params });
export const postStatusesParamsChanged = ({ params }) =>
  ({ type: types.POST_STATUSES_PARAMS_CHANGED, params });

export const postsListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.POSTS_LIST_REQUESTED, params, current, page });
export const postsListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.POSTS_LIST_SUCCEED, params, entities, result, key, current, page });
export const postsListFailed = ({ params, error, endpoint }) =>
  ({ type: types.POSTS_LIST_FAILED, params, error, endpoint });
export const postRequested = ({ id, current }) => ({ type: types.POST_REQUESTED, id, current });
export const postSucceed = ({ id, post, current }) =>
  ({ type: types.POST_SUCCEED, id, post, current });
export const postFailed = ({ id, error, endpoint }) =>
  ({ type: types.POST_FAILED, id, error, endpoint });

export const pagesListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.PAGES_LIST_REQUESTED, params, current, page });
export const pagesListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.PAGES_LIST_SUCCEED, params, entities, result, key, current, page });
export const pagesListFailed = ({ params, error, endpoint }) =>
  ({ type: types.PAGES_LIST_FAILED, params, error, endpoint });
export const pageRequested = ({ id, current }) => ({ type: types.PAGE_REQUESTED, id, current });
export const pageSucceed = ({ id, page, current }) =>
  ({ type: types.PAGE_SUCCEED, id, page, current });
export const pageFailed = ({ id, error, endpoint }) =>
  ({ type: types.PAGE_FAILED, id, error, endpoint });

export const tagsListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.TAGS_LIST_REQUESTED, params, current, page });
export const tagsListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.TAGS_LIST_SUCCEED, params, entities, result, key, current, page });
export const tagsListFailed = ({ params, error, endpoint }) =>
  ({ type: types.TAGS_LIST_FAILED, params, error, endpoint });
export const tagRequested = ({ id, current }) => ({ type: types.TAG_REQUESTED, id, current });
export const tagSucceed = ({ id, tag, current }) => ({ type: types.TAG_SUCCEED, id, tag, current });
export const tagFailed = ({ id, error, endpoint }) =>
  ({ type: types.TAG_FAILED, id, error, endpoint });

export const usersListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.USERS_LIST_REQUESTED, params, current, page });
export const usersListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.USERS_LIST_SUCCEED, params, entities, result, key, current, page });
export const usersListFailed = ({ params, error, endpoint }) =>
  ({ type: types.USERS_LIST_FAILED, params, error, endpoint });
export const userRequested = ({ id, current }) => ({ type: types.USER_REQUESTED, id, current });
export const userSucceed = ({ id, user, current }) =>
  ({ type: types.USER_SUCCEED, id, user, current });
export const userFailed = ({ id, error, endpoint }) =>
  ({ type: types.USER_FAILED, id, error, endpoint });

export const mediaListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.MEDIA_LIST_REQUESTED, params, current, page });
export const mediaListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.MEDIA_LIST_SUCCEED, params, entities, result, key, current, page });
export const mediaListFailed = ({ params, error, endpoint }) =>
  ({ type: types.MEDIA_LIST_FAILED, params, error, endpoint });
export const mediaRequested = ({ id, current }) => ({ type: types.MEDIA_REQUESTED, id, current });
export const mediaSucceed = ({ id, media, current }) =>
  ({ type: types.MEDIA_SUCCEED, id, media, current });
export const mediaFailed = ({ id, error, endpoint }) =>
  ({ type: types.MEDIA_FAILED, id, error, endpoint });

export const categoriesListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.CATEGORIES_LIST_REQUESTED, params, current, page });
export const categoriesListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.CATEGORIES_LIST_SUCCEED, params, entities, result, key, current, page });
export const categoriesListFailed = ({ params, error, endpoint }) =>
  ({ type: types.CATEGORIES_LIST_FAILED, params, error, endpoint });
export const categoryRequested = ({ id, current }) =>
  ({ type: types.CATEGORY_REQUESTED, id, current });
export const categorySucceed = ({ id, category, current }) =>
  ({ type: types.CATEGORY_SUCCEED, id, category, current });
export const categoryFailed = ({ id, error, endpoint }) =>
  ({ type: types.CATEGORY_FAILED, id, error, endpoint });

export const commentsListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.COMMENTS_LIST_REQUESTED, params, current, page });
export const commentsListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.COMMENTS_LIST_SUCCEED, params, entities, result, key, current, page });
export const commentsListFailed = ({ params, error, endpoint }) =>
  ({ type: types.COMMENTS_LIST_FAILED, params, error, endpoint });
export const commentRequested = ({ id, current }) =>
  ({ type: types.COMMENT_REQUESTED, id, current });
export const commentSucceed = ({ id, comment, current }) =>
  ({ type: types.COMMENT_SUCCEED, id, comment, current });
export const commentFailed = ({ id, error, endpoint }) =>
  ({ type: types.COMMENT_FAILED, id, error, endpoint });

export const taxonomiesListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.TAXONOMIES_LIST_REQUESTED, params, current, page });
export const taxonomiesListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.TAXONOMIES_LIST_SUCCEED, params, entities, result, key, current, page });
export const taxonomiesListFailed = ({ params, error, endpoint }) =>
  ({ type: types.TAXONOMIES_LIST_FAILED, params, error, endpoint });
export const taxonomyRequested = ({ id, current }) =>
  ({ type: types.TAXONOMY_REQUESTED, id, current });
export const taxonomySucceed = ({ id, taxonomy, current }) =>
  ({ type: types.TAXONOMY_SUCCEED, id, taxonomy, current });
export const taxonomyFailed = ({ id, error, endpoint }) =>
  ({ type: types.TAXONOMY_FAILED, id, error, endpoint });

export const postTypesListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.POST_TYPES_LIST_REQUESTED, params, current, page });
export const postTypesListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.POST_TYPES_LIST_SUCCEED, params, entities, result, key, current, page });
export const postTypesListFailed = ({ params, error, endpoint }) =>
  ({ type: types.POST_TYPES_LIST_FAILED, params, error, endpoint });
export const postTypeRequested = ({ id, current }) =>
  ({ type: types.POST_TYPE_REQUESTED, id, current });
export const postTypeSucceed = ({ id, postType, current }) =>
  ({ type: types.POST_TYPE_SUCCEED, id, postType, current });
export const postTypeFailed = ({ id, error, endpoint }) =>
  ({ type: types.POST_TYPE_FAILED, id, error, endpoint });

export const postStatusesListRequested = ({ params = {}, current = false, page = 1 } = {}) =>
  ({ type: types.POST_STATUSES_LIST_REQUESTED, params, current, page });
export const postStatusesListSucceed = ({ params, entities, result, key, current, page }) =>
  ({ type: types.POST_STATUSES_LIST_SUCCEED, params, entities, result, key, current, page });
export const postStatusesListFailed = ({ params, error, endpoint }) =>
  ({ type: types.POST_STATUSES_LIST_FAILED, params, error, endpoint });
export const postStatusRequested = ({ id, current }) =>
  ({ type: types.POST_STATUS_REQUESTED, id, current });
export const postStatusSucceed = ({ id, postStatus, current }) =>
  ({ type: types.POST_STATUS_SUCCEED, id, postStatus, current });
export const postStatusFailed = ({ id, error, endpoint }) =>
  ({ type: types.POST_STATUS_FAILED, id, error, endpoint });
