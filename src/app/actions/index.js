import * as types from '../types';

export const refreshPostsRequested = (action = {}) =>
  ({ type: types.REFRESH_POSTS_REQUESTED, params: action.params });
export const refreshPostsSucceed = ({ posts, params }) =>
  ({ type: types.REFRESH_POSTS_SUCCEED, posts, params });
export const refreshPostsFailed = ({ error, params }) =>
  ({ type: types.REFRESH_POSTS_FAILED, error, params });

export const refreshCategoriesRequested = () => ({ type: types.REFRESH_CATEGORIES_REQUESTED });
export const refreshCategoriesSucceed = ({ categories }) =>
  ({ type: types.REFRESH_CATEGORIES_SUCCEED, categories });
export const refreshCategoriesFailed = ({ error }) =>
  ({ type: types.REFRESH_CATEGORIES_FAILED, error });

export const newCategorySelected = ({ categories }) =>
  ({ type: types.NEW_CATEGORIES_SELECTED, categories });
