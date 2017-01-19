import * as types from '../types';

export const globalParamsChanged = ({ params, options }) =>
  ({ type: types.GLOBAL_PARAMS_CHANGED, params, options });

export const postsListRequested = ({ params }) => ({ type: types.POSTS_LIST_REQUESTED, params });
export const postsListSucceed = ({ params, posts }) =>
  ({ type: types.POSTS_LIST_SUCCEED, params, posts });
export const postsListFailed = ({ params, error }) =>
  ({ type: types.POSTS_LIST_FAILED, params, error });
export const postRequested = ({ id }) => ({ type: types.POST_REQUESTED, id });
export const postSucceed = ({ id, post }) => ({ type: types.POST_SUCCEED, id, post });
export const postFailed = ({ id, error }) => ({ type: types.POST_FAILED, id, error });

export const pagesListRequested = ({ params }) => ({ type: types.PAGES_LIST_REQUESTED, params });
export const pagesListSucceed = ({ params, pages }) =>
  ({ type: types.PAGES_LIST_SUCCEED, params, pages });
export const pagesListFailed = ({ params, error }) =>
  ({ type: types.PAGES_LIST_FAILED, params, error });
export const pageRequested = ({ id }) => ({ type: types.PAGE_REQUESTED, id });
export const pageSucceed = ({ id, page }) => ({ type: types.PAGE_SUCCEED, id, page });
export const pageFailed = ({ id, error }) => ({ type: types.PAGE_FAILED, id, error });

export const tagsListRequested = ({ params }) => ({ type: types.TAGS_LIST_REQUESTED, params });
export const tagsListSucceed = ({ params, tags }) =>
  ({ type: types.TAGS_LIST_SUCCEED, params, tags });
export const tagsListFailed = ({ params, error }) =>
  ({ type: types.TAGS_LIST_FAILED, params, error });
export const tagRequested = ({ id }) => ({ type: types.TAG_REQUESTED, id });
export const tagSucceed = ({ id, tag }) => ({ type: types.TAG_SUCCEED, id, tag });
export const tagFailed = ({ id, error }) => ({ type: types.TAG_FAILED, id, error });

export const usersListRequested = ({ params }) => ({ type: types.USERS_LIST_REQUESTED, params });
export const usersListSucceed = ({ params, users }) =>
  ({ type: types.USERS_LIST_SUCCEED, params, users });
export const usersListFailed = ({ params, error }) =>
  ({ type: types.USERS_LIST_FAILED, params, error });
export const userRequested = ({ id }) => ({ type: types.USER_REQUESTED, id });
export const userSucceed = ({ id, user }) => ({ type: types.USER_SUCCEED, id, user });
export const userFailed = ({ id, error }) => ({ type: types.USER_FAILED, id, error });

export const mediaListRequested = ({ params }) => ({ type: types.MEDIA_LIST_REQUESTED, params });
export const mediaListSucceed = ({ params, media }) =>
  ({ type: types.MEDIA_LIST_SUCCEED, params, media });
export const mediaListFailed = ({ params, error }) =>
  ({ type: types.MEDIA_LIST_FAILED, params, error });
export const mediaRequested = ({ id }) => ({ type: types.MEDIA_REQUESTED, id });
export const mediaSucceed = ({ id, media }) => ({ type: types.MEDIA_SUCCEED, id, media });
export const mediaFailed = ({ id, error }) => ({ type: types.MEDIA_FAILED, id, error });

export const categoriesListRequested = ({ params }) =>
  ({ type: types.CATEGORIES_LIST_REQUESTED, params });
export const categoriesListSucceed = ({ params, categories }) =>
  ({ type: types.CATEGORIES_LIST_SUCCEED, params, categories });
export const categoriesListFailed = ({ params, error }) =>
  ({ type: types.CATEGORIES_LIST_FAILED, params, error });
export const categoryRequested = ({ id }) => ({ type: types.CATEGORY_REQUESTED, id });
export const categorySucceed = ({ id, category }) =>
  ({ type: types.CATEGORY_SUCCEED, id, category });
export const categoryFailed = ({ id, error }) => ({ type: types.CATEGORY_FAILED, id, error });

export const commentsListRequested = ({ params }) =>
  ({ type: types.COMMENTS_LIST_REQUESTED, params });
export const commentsListSucceed = ({ params, comments }) =>
  ({ type: types.COMMENTS_LIST_SUCCEED, params, comments });
export const commentsListFailed = ({ params, error }) =>
  ({ type: types.COMMENTS_LIST_FAILED, params, error });
export const commentRequested = ({ id }) => ({ type: types.COMMENT_REQUESTED, id });
export const commentSucceed = ({ id, comment }) => ({ type: types.COMMENT_SUCCEED, id, comment });
export const commentFailed = ({ id, error }) => ({ type: types.COMMENT_FAILED, id, error });

export const taxonomiesListRequested = ({ params }) =>
  ({ type: types.TAXONOMIES_LIST_REQUESTED, params });
export const taxonomiesListSucceed = ({ params, taxonomies }) =>
  ({ type: types.TAXONOMIES_LIST_SUCCEED, params, taxonomies });
export const taxonomiesListFailed = ({ params, error }) =>
  ({ type: types.TAXONOMIES_LIST_FAILED, params, error });
export const taxonomyRequested = ({ id }) => ({ type: types.TAXONOMY_REQUESTED, id });
export const taxonomySucceed = ({ id, taxonomy }) =>
  ({ type: types.TAXONOMY_SUCCEED, id, taxonomy });
export const taxonomyFailed = ({ id, error }) => ({ type: types.TAXONOMY_FAILED, id, error });

export const postTypesListRequested = ({ params }) =>
  ({ type: types.POST_TYPES_LIST_REQUESTED, params });
export const postTypesListSucceed = ({ params, postTypes }) =>
  ({ type: types.POST_TYPES_LIST_SUCCEED, params, postTypes });
export const postTypesListFailed = ({ params, error }) =>
  ({ type: types.POST_TYPES_LIST_FAILED, params, error });
export const postTypeRequested = ({ id }) => ({ type: types.POST_TYPE_REQUESTED, id });
export const postTypeSucceed = ({ id, postType }) =>
  ({ type: types.POST_TYPE_SUCCEED, id, postType });
export const postTypeFailed = ({ id, error }) => ({ type: types.POST_TYPE_FAILED, id, error });

export const postStatusesListRequested = ({ params }) =>
  ({ type: types.POST_STATUSES_LIST_REQUESTED, params });
export const postStatusesListSucceed = ({ params, postStatuses }) =>
  ({ type: types.POST_STATUSES_LIST_SUCCEED, params, postStatuses });
export const postStatusesListFailed = ({ params, error }) =>
  ({ type: types.POST_STATUSES_LIST_FAILED, params, error });
export const postStatusRequested = ({ id }) => ({ type: types.POST_STATUS_REQUESTED, id });
export const postStatusSucceed = ({ id, postStatus }) =>
  ({ type: types.POST_STATUS_SUCCEED, id, postStatus });
export const postStatusFailed = ({ id, error }) => ({ type: types.POST_STATUS_FAILED, id, error });
