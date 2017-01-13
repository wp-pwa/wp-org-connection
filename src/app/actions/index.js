import * as types from '../types';

export const refreshPostsRequested = () => ({
  type: types.REFRESH_POSTS_REQUESTED,
});
export const refreshPostsSucceed = ({ posts }) => ({
  type: types.REFRESH_POSTS_SUCCEED, posts,
});
export const refreshPostsFailed = ({ error }) => ({
  type: types.REFRESH_POSTS_FAILED, error,
});

export const refreshCategoriesRequested = () => ({
  type: types.REFRESH_CATEGORIES_REQUESTED,
});
export const refreshCategoriesSucceed = ({ categories }) => ({
  type: types.REFRESH_CATEGORIES_SUCCEED, categories,
});
export const refreshCategoriesFailed = ({ error }) => ({
  type: types.REFRESH_CATEGORIES_FAILED, error,
});
