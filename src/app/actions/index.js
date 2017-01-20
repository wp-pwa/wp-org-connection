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

export const postsListRequested = ({ params, current }) =>
  ({ type: types.POSTS_LIST_REQUESTED, params, current });
export const postsListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.POSTS_LIST_SUCCEED, params, entities, result, key, current });
export const postsListFailed = ({ params, error }) =>
  ({ type: types.POSTS_LIST_FAILED, params, error });
export const postRequested = ({ id, current }) => ({ type: types.POST_REQUESTED, id, current });
export const postSucceed = ({ id, post, current }) =>
  ({ type: types.POST_SUCCEED, id, post, current });
export const postFailed = ({ id, error }) => ({ type: types.POST_FAILED, id, error });

export const pagesListRequested = ({ params, current }) =>
  ({ type: types.PAGES_LIST_REQUESTED, params, current });
export const pagesListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.PAGES_LIST_SUCCEED, params, entities, result, key, current });
export const pagesListFailed = ({ params, error }) =>
  ({ type: types.PAGES_LIST_FAILED, params, error });
export const pageRequested = ({ id, current }) => ({ type: types.PAGE_REQUESTED, id, current });
export const pageSucceed = ({ id, page, current }) =>
  ({ type: types.PAGE_SUCCEED, id, page, current });
export const pageFailed = ({ id, error }) => ({ type: types.PAGE_FAILED, id, error });

export const tagsListRequested = ({ params, current }) =>
  ({ type: types.TAGS_LIST_REQUESTED, params, current });
export const tagsListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.TAGS_LIST_SUCCEED, params, entities, result, key, current });
export const tagsListFailed = ({ params, error }) =>
  ({ type: types.TAGS_LIST_FAILED, params, error });
export const tagRequested = ({ id, current }) => ({ type: types.TAG_REQUESTED, id, current });
export const tagSucceed = ({ id, tag, current }) => ({ type: types.TAG_SUCCEED, id, tag, current });
export const tagFailed = ({ id, error }) => ({ type: types.TAG_FAILED, id, error });

export const usersListRequested = ({ params, current }) =>
  ({ type: types.USERS_LIST_REQUESTED, params, current });
export const usersListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.USERS_LIST_SUCCEED, params, entities, result, key, current });
export const usersListFailed = ({ params, error }) =>
  ({ type: types.USERS_LIST_FAILED, params, error });
export const userRequested = ({ id, current }) => ({ type: types.USER_REQUESTED, id, current });
export const userSucceed = ({ id, user, current }) =>
  ({ type: types.USER_SUCCEED, id, user, current });
export const userFailed = ({ id, error }) => ({ type: types.USER_FAILED, id, error });

export const mediaListRequested = ({ params, current }) =>
  ({ type: types.MEDIA_LIST_REQUESTED, params, current });
export const mediaListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.MEDIA_LIST_SUCCEED, params, entities, result, key, current });
export const mediaListFailed = ({ params, error }) =>
  ({ type: types.MEDIA_LIST_FAILED, params, error });
export const mediaRequested = ({ id, current }) => ({ type: types.MEDIA_REQUESTED, id, current });
export const mediaSucceed = ({ id, media, current }) =>
  ({ type: types.MEDIA_SUCCEED, id, media, current });
export const mediaFailed = ({ id, error }) => ({ type: types.MEDIA_FAILED, id, error });

export const categoriesListRequested = ({ params, current }) =>
  ({ type: types.CATEGORIES_LIST_REQUESTED, params, current });
export const categoriesListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.CATEGORIES_LIST_SUCCEED, params, entities, result, key, current });
export const categoriesListFailed = ({ params, error }) =>
  ({ type: types.CATEGORIES_LIST_FAILED, params, error });
export const categoryRequested = ({ id, current }) =>
  ({ type: types.CATEGORY_REQUESTED, id, current });
export const categorySucceed = ({ id, category, current }) =>
  ({ type: types.CATEGORY_SUCCEED, id, category, current });
export const categoryFailed = ({ id, error }) => ({ type: types.CATEGORY_FAILED, id, error });

export const commentsListRequested = ({ params, current }) =>
  ({ type: types.COMMENTS_LIST_REQUESTED, params, current });
export const commentsListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.COMMENTS_LIST_SUCCEED, params, entities, result, key, current });
export const commentsListFailed = ({ params, error }) =>
  ({ type: types.COMMENTS_LIST_FAILED, params, error });
export const commentRequested = ({ id, current }) =>
  ({ type: types.COMMENT_REQUESTED, id, current });
export const commentSucceed = ({ id, comment, current }) =>
  ({ type: types.COMMENT_SUCCEED, id, comment, current });
export const commentFailed = ({ id, error }) => ({ type: types.COMMENT_FAILED, id, error });

export const taxonomiesListRequested = ({ params, current }) =>
  ({ type: types.TAXONOMIES_LIST_REQUESTED, params, current });
export const taxonomiesListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.TAXONOMIES_LIST_SUCCEED, params, entities, result, key, current });
export const taxonomiesListFailed = ({ params, error }) =>
  ({ type: types.TAXONOMIES_LIST_FAILED, params, error });
export const taxonomyRequested = ({ id, current }) =>
  ({ type: types.TAXONOMY_REQUESTED, id, current });
export const taxonomySucceed = ({ id, taxonomy, current }) =>
  ({ type: types.TAXONOMY_SUCCEED, id, taxonomy, current });
export const taxonomyFailed = ({ id, error }) => ({ type: types.TAXONOMY_FAILED, id, error });

export const postTypesListRequested = ({ params, current }) =>
  ({ type: types.POST_TYPES_LIST_REQUESTED, params, current });
export const postTypesListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.POST_TYPES_LIST_SUCCEED, params, entities, result, key, current });
export const postTypesListFailed = ({ params, error }) =>
  ({ type: types.POST_TYPES_LIST_FAILED, params, error });
export const postTypeRequested = ({ id, current }) =>
  ({ type: types.POST_TYPE_REQUESTED, id, current });
export const postTypeSucceed = ({ id, postType, current }) =>
  ({ type: types.POST_TYPE_SUCCEED, id, postType, current });
export const postTypeFailed = ({ id, error }) => ({ type: types.POST_TYPE_FAILED, id, error });

export const postStatusesListRequested = ({ params, current }) =>
  ({ type: types.POST_STATUSES_LIST_REQUESTED, params, current });
export const postStatusesListSucceed = ({ params, entities, result, key, current }) =>
  ({ type: types.POST_STATUSES_LIST_SUCCEED, params, entities, result, key, current });
export const postStatusesListFailed = ({ params, error }) =>
  ({ type: types.POST_STATUSES_LIST_FAILED, params, error });
export const postStatusRequested = ({ id, current }) =>
  ({ type: types.POST_STATUS_REQUESTED, id, current });
export const postStatusSucceed = ({ id, postStatus, current }) =>
  ({ type: types.POST_STATUS_SUCCEED, id, postStatus, current });
export const postStatusFailed = ({ id, error }) => ({ type: types.POST_STATUS_FAILED, id, error });
