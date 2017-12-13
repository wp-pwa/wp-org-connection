import * as actionTypes from '../actionTypes';

const parse = id => (Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : id);

export const singleRequested = ({ singleType, singleId }) => ({
  type: actionTypes.SINGLE_REQUESTED,
  singleType,
  singleId: parse(singleId),
});
export const singleSucceed = ({ singleType, singleId, entities }) => ({
  type: actionTypes.SINGLE_SUCCEED,
  singleType,
  singleId: parse(singleId),
  entities,
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
  selected: { listType, listId, page, singleType, singleId },
  method = 'push',
  context = null,
}) => {
  if (listType && !page) page = 1;
  if (listType === 'latest' && !listId) listId = 'post';
  const selected = {};
  if (listType) selected.listType = listType;
  if (listId) selected.listId = parse(listId);
  if (page) selected.page = parse(page);
  if (singleType) selected.singleType = singleType;
  if (singleId !== undefined) selected.singleId = parse(singleId);
  return {
    type: actionTypes.ROUTE_CHANGE_REQUESTED,
    selected,
    method,
    context,
  };
};
export const routeChangeSucceed = ({
  selected: { listType, listId, page, singleType, singleId },
  method = 'push',
  context = null,
}) => {
  if (listType && !page) page = 1;
  if (listType === 'latest' && !listId) listId = 'post';
  const selected = {};
  if (listType) selected.listType = listType;
  if (listId) selected.listId = parse(listId);
  if (page) selected.page = parse(page);
  if (singleType) selected.singleType = singleType;
  if (singleId !== undefined) selected.singleId = parse(singleId);
  return {
    type: actionTypes.ROUTE_CHANGE_SUCCEED,
    selected,
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
