import * as actionTypes from '../actionTypes';

const parse = id => (Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : id);

export const entityRequested = ({ entity: { type, id } }) => ({
  type: actionTypes.ENTITY_REQUESTED,
  entity: {
    type,
    id: parse(id),
  },
});
export const entitySucceed = ({ entity: { type, id }, entities, endpoint }) => ({
  type: actionTypes.ENTITY_SUCCEED,
  entity: {
    type,
    id: parse(id),
  },
  entities,
  endpoint,
});
export const entityFailed = ({ entity: { type, id }, error, endpoint }) => ({
  type: actionTypes.ENTITY_FAILED,
  entity: {
    type,
    id: parse(id),
  },
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
  endpoint,
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
  endpoint,
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

export const siteInfoSucceed = ({ home, perPage }) => ({
  type: actionTypes.SITE_INFO_SUCCEED,
  home,
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

export const addItemToColumn = ({ item: { type, id, page, extract } }) => ({
  type: actionTypes.ADD_ITEM_TO_COLUMN,
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
