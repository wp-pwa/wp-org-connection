import { flow, mapValues, mapKeys } from 'lodash/fp';

const wpTypes = {
  POSTS: 'POSTS',
  PAGES: 'PAGES',
  TAGS: 'CATEGORIES',
  USERS: 'TAGS',
  MEDIA: 'USERS',
  CATEGORIES: 'MEDIA',
  COMMENTS: 'COMMENTS',
  TAXONOMIES: 'TAXONOMIES',
  POST_TYPES: 'POST_TYPES',
  POST_STATUSES: 'POST_STATUSES',
};

const paramsChanged = flow(
  mapValues(value => `connection/${value}_PARAMS_CHANGED`),
  mapKeys(key => `${key}_PARAMS_CHANGED`),
)(wpTypes);

const newListRequested = flow(
  mapValues(value => `connection/NEW_${value}_LIST_REQUESTED`),
  mapKeys(key => `NEW_${key}_LIST_REQUESTED`),
)(wpTypes);

const newListSucceed = flow(
  mapValues(value => `connection/NEW_${value}_LIST_SUCCEED`),
  mapKeys(key => `NEW_${key}_LIST_SUCCEED`),
)(wpTypes);

module.exports = { ...paramsChanged, ...newListRequested, ...newListSucceed };

// export const POSTS_LIST_REQUESTED = 'connection/POSTS_LIST_REQUESTED';
// export const POSTS_LIST_SUCCEED = 'connection/POSTS_LIST_SUCCEED';
// export const POSTS_LIST_FAILED = 'connection/POSTS_LIST_FAILED';
// export const POST_REQUESTED = 'connection/POST_REQUESTED';
// export const POST_SUCCEED = 'connection/POST_SUCCEED';
// export const POST_FAILED = 'connection/POST_FAILED';
//
// export const PAGES_LIST_REQUESTED = 'connection/PAGES_LIST_REQUESTED';
// export const PAGES_LIST_SUCCEED = 'connection/PAGES_LIST_SUCCEED';
// export const PAGES_LIST_FAILED = 'connection/PAGES_LIST_FAILED';
// export const PAGE_REQUESTED = 'connection/PAGE_REQUESTED';
// export const PAGE_SUCCEED = 'connection/PAGE_SUCCEED';
// export const PAGE_FAILED = 'connection/PAGE_FAILED';
//
// export const TAGS_LIST_REQUESTED = 'connection/TAGS_LIST_REQUESTED';
// export const TAGS_LIST_SUCCEED = 'connection/TAGS_LIST_SUCCEED';
// export const TAGS_LIST_FAILED = 'connection/TAGS_LIST_FAILED';
// export const TAG_REQUESTED = 'connection/TAG_REQUESTED';
// export const TAG_SUCCEED = 'connection/TAG_SUCCEED';
// export const TAG_FAILED = 'connection/TAG_FAILED';
//
// export const USERS_LIST_REQUESTED = 'connection/USERS_LIST_REQUESTED';
// export const USERS_LIST_SUCCEED = 'connection/USERS_LIST_SUCCEED';
// export const USERS_LIST_FAILED = 'connection/USERS_LIST_FAILED';
// export const USER_REQUESTED = 'connection/USER_REQUESTED';
// export const USER_SUCCEED = 'connection/USER_SUCCEED';
// export const USER_FAILED = 'connection/USER_FAILED';
//
// export const MEDIA_LIST_REQUESTED = 'connection/MEDIA_LIST_REQUESTED';
// export const MEDIA_LIST_SUCCEED = 'connection/MEDIA_LIST_SUCCEED';
// export const MEDIA_LIST_FAILED = 'connection/MEDIA_LIST_FAILED';
// export const MEDIA_REQUESTED = 'connection/MEDIA_REQUESTED';
// export const MEDIA_SUCCEED = 'connection/MEDIA_SUCCEED';
// export const MEDIA_FAILED = 'connection/MEDIA_FAILED';
//
// export const CATEGORIES_LIST_REQUESTED = 'connection/CATEGORIES_LIST_REQUESTED';
// export const CATEGORIES_LIST_SUCCEED = 'connection/CATEGORIES_LIST_SUCCEED';
// export const CATEGORIES_LIST_FAILED = 'connection/CATEGORIES_LIST_FAILED';
// export const CATEGORY_REQUESTED = 'connection/CATEGORY_REQUESTED';
// export const CATEGORY_SUCCEED = 'connection/CATEGORY_SUCCEED';
// export const CATEGORY_FAILED = 'connection/CATEGORY_FAILED';
//
// export const COMMENTS_LIST_REQUESTED = 'connection/COMMENTS_LIST_REQUESTED';
// export const COMMENTS_LIST_SUCCEED = 'connection/COMMENTS_LIST_SUCCEED';
// export const COMMENTS_LIST_FAILED = 'connection/COMMENTS_LIST_FAILED';
// export const COMMENT_REQUESTED = 'connection/COMMENT_REQUESTED';
// export const COMMENT_SUCCEED = 'connection/COMMENT_SUCCEED';
// export const COMMENT_FAILED = 'connection/COMMENT_FAILED';
//
// export const TAXONOMIES_LIST_REQUESTED = 'connection/TAXONOMIES_LIST_REQUESTED';
// export const TAXONOMIES_LIST_SUCCEED = 'connection/TAXONOMIES_LIST_SUCCEED';
// export const TAXONOMIES_LIST_FAILED = 'connection/TAXONOMIES_LIST_FAILED';
// export const TAXONOMY_REQUESTED = 'connection/TAXONOMY_REQUESTED';
// export const TAXONOMY_SUCCEED = 'connection/TAXONOMY_SUCCEED';
// export const TAXONOMY_FAILED = 'connection/TAXONOMY_FAILED';
//
// export const POST_TYPES_LIST_REQUESTED = 'connection/POST_TYPES_LIST_REQUESTED';
// export const POST_TYPES_LIST_SUCCEED = 'connection/POST_TYPES_LIST_SUCCEED';
// export const POST_TYPES_LIST_FAILED = 'connection/POST_TYPES_LIST_FAILED';
// export const POST_TYPE_REQUESTED = 'connection/POST_TYPE_REQUESTED';
// export const POST_TYPE_SUCCEED = 'connection/POST_TYPE_SUCCEED';
// export const POST_TYPE_FAILED = 'connection/POST_TYPE_FAILED';
//
// export const POST_STATUSES_LIST_REQUESTED = 'connection/POST_STATUSES_LIST_REQUESTED';
// export const POST_STATUSES_LIST_SUCCEED = 'connection/POST_STATUSES_LIST_SUCCEED';
// export const POST_STATUSES_LIST_FAILED = 'connection/POST_STATUSES_LIST_FAILED';
// export const POST_STATUS_REQUESTED = 'connection/POST_STATUS_REQUESTED';
// export const POST_STATUS_SUCCEED = 'connection/POST_STATUS_SUCCEED';
// export const POST_STATUS_FAILED = 'connection/POST_STATUS_FAILED';
