import * as actionTypes from '../actionTypes';

const parse = id => (Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : id);

export const singleRequested = ({ singleType, singleId }) => ({
  type: actionTypes.SINGLE_REQUESTED,
  singleType,
  singleId: parse(singleId),
});
export const singleSucceed = ({ singleType, singleId, entities, endpoint }) => ({
  type: actionTypes.SINGLE_SUCCEED,
  singleType,
  singleId: parse(singleId),
  entities,
  endpoint,
});
export const singleFailed = ({ singleType, singleId, error, endpoint }) => ({
  type: actionTypes.SINGLE_FAILED,
  singleType,
  singleId: parse(singleId),
  error,
  endpoint,
});

export const listRequested = ({ listType, listId, page = 1 }) => {
  if (listType === 'latest' && !listId) listId = 'post';
  return {
    type: actionTypes.LIST_REQUESTED,
    listType,
    listId: parse(listId),
    page: parse(page),
  };
};
export const listSucceed = ({
  listType,
  listId = null,
  page = 1,
  total = { entities: 0, pages: 0 },
  result,
  entities,
  endpoint,
}) => {
  if (listType === 'latest' && !listId) listId = 'post';
  return {
    type: actionTypes.LIST_SUCCEED,
    listType,
    listId: parse(listId),
    page: parse(page),
    total,
    result,
    entities,
    endpoint,
  };
};
export const listFailed = ({ listType, listId, page = 1, error, endpoint }) => ({
  type: actionTypes.LIST_FAILED,
  listType,
  listId: parse(listId),
  page: parse(page),
  error,
  endpoint,
});

export const customRequested = ({ url = '/', name, singleType, page = 1, params = {} }) => ({
  type: actionTypes.CUSTOM_REQUESTED,
  url,
  name,
  singleType,
  page: parse(page),
  params,
});
export const customSucceed = ({
  url = '/',
  name,
  singleType,
  params = {},
  page = 1,
  total = { entities: 0, pages: 0 },
  result,
  entities,
}) => ({
  type: actionTypes.CUSTOM_SUCCEED,
  url,
  name,
  singleType,
  params,
  page: parse(page),
  total,
  result,
  entities,
});
export const customFailed = ({
  url = '/',
  name,
  singleType,
  params = {},
  page = 1,
  error,
  endpoint,
}) => ({
  type: actionTypes.CUSTOM_FAILED,
  url,
  name,
  singleType,
  params,
  page: parse(page),
  error,
  endpoint,
});

export const routeChangeRequested = ({
  selectedItem: { type, id, page },
  method = 'push',
  context = null,
  event = null,
}) => {
  const selectedItem = {
    type,
    id: parse(id),
    page,
  };
  return {
    type: actionTypes.ROUTE_CHANGE_REQUESTED,
    selectedItem,
    method,
    context,
    event,
  };
};

export const routeChangeSucceed = ({
  selectedItem: { type, id, page },
  method = 'push',
  context = null,
}) => {
  const selectedItem = {
    type,
    id: parse(id),
    page,
  };
  return {
    type: actionTypes.ROUTE_CHANGE_SUCCEED,
    selectedItem,
    method,
    context,
  };
};

export const routeChangeFailed = () => ({
  type: actionTypes.ROUTE_CHANGE_FAILED,
});

export const siteInfoRequested = () => ({
  type: actionTypes.SITE_INFO_REQUESTED,
});

export const siteInfoSucceed = ({ home: { title, description }, perPage }) => ({
  type: actionTypes.SITE_INFO_SUCCEED,
  home: {
    title,
    description,
  },
  perPage: parseInt(perPage, 10),
});

export const siteInfoFailed = ({ error }) => ({
  type: actionTypes.SITE_INFO_FAILED,
  error,
});

export const headContentRequested = () => ({
  type: actionTypes.HEAD_CONTENT_REQUESTED,
});

export const headContentSucceed = ({ content }) => ({
  type: actionTypes.HEAD_CONTENT_SUCCEED,
  content,
});

export const headContentFailed = ({ error }) => ({
  type: actionTypes.HEAD_CONTENT_FAILED,
  error,
});

export const moveItemToColumn = ({ item: { type, id, page, extract } }) => ({
  type: actionTypes.MOVE_ITEM_TO_COLUMN,
  item: {
    type,
    id,
    page,
    extract,
  },
});

export const replaceContext = ({ context }) => ({
  type: actionTypes.REPLACE_CONTEXT,
  context,
});
