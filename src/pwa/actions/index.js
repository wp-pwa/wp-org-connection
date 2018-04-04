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

export const listRequested = ({ list }) => {
  if (typeof list.page === 'undefined') {
    throw new Error('The field `page` is mandatory in listRequested.');
  }

  return {
    type: actionTypes.LIST_REQUESTED,
    list: {
      ...list,
      id: parse(list.id),
      page: parse(list.page),
    },
  };
};
export const listSucceed = ({
  list,
  total = { entities: 0, pages: 0 },
  result,
  entities,
  endpoint,
}) => ({
  type: actionTypes.LIST_SUCCEED,
  list: {
    ...list,
    id: parse(list.id),
    page: parse(list.page),
  },
  total,
  result,
  entities,
  endpoint,
});
export const listFailed = ({ list, error, endpoint }) => ({
  type: actionTypes.LIST_FAILED,
  list: {
    ...list,
    id: parse(list.id),
    page: parse(list.page),
  },
  error,
  endpoint,
});

export const customRequested = ({ custom, url = '/', params = {} }) => {
  if (typeof custom.page === 'undefined') {
    throw new Error('The field `page` is mandatory in customRequested.');
  }

  return {
    type: actionTypes.CUSTOM_REQUESTED,
    custom: { ...custom, page: parse(custom.page) },
    url,
    params,
  };
};
export const customSucceed = ({
  custom,
  url = '/',
  params = {},
  total = { entities: 0, pages: 0 },
  result,
  entities,
  endpoint,
}) => ({
  type: actionTypes.CUSTOM_SUCCEED,
  custom: { ...custom, page: parse(custom.page) },
  url,
  params,
  total,
  result,
  entities,
  endpoint,
});
export const customFailed = ({ custom, url = '/', params = {}, error, endpoint }) => ({
  type: actionTypes.CUSTOM_FAILED,
  custom: { ...custom, page: parse(custom.page) },
  url,
  params,
  error,
  endpoint,
});

export const routeChangeRequested = ({
  selectedItem,
  method = 'push',
  context = null,
  event = null,
}) => ({
  type: actionTypes.ROUTE_CHANGE_REQUESTED,
  selectedItem: { ...selectedItem, id: parse(selectedItem.id) },
  method,
  context,
  event,
});

export const routeChangeSucceed = ({ selectedItem, method = 'push', context = null }) => ({
  type: actionTypes.ROUTE_CHANGE_SUCCEED,
  selectedItem: { ...selectedItem, id: parse(selectedItem.id) },
  method,
  context,
});

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

export const previousContextRequested = () => ({
  type: actionTypes.PREVIOUS_CONTEXT_REQUESTED,
});

export const replaceContext = ({ context }) => ({
  type: actionTypes.REPLACE_CONTEXT,
  context,
});
