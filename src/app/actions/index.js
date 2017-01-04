import * as types from '../types';

export const refreshPostsRequested = () => ({
  type: types.REFRESH_POSTS_REQUESTED,
});
export const refreshPostsSucceed = () => ({
  type: types.REFRESH_POSTS_SUCCEED,
});
export const refreshPostsFailed = () => ({
  type: types.REFRESH_POSTS_FAILED,
});
