import { observable } from 'mobx';
import { join } from './utils';

export const link = (type, id) => {
  if (!id) return '/';
  if (type === 'category') return `/?cat=${id}`;
  if (type === 'tag') return `/?tag_ID=${id}`;
  if (type === 'author') return `/?author=${id}`;
  if (type === 'media') return `/?attachement_id=${id}`;
  if (type === 'post' || type === 'page') return `/?p=${id}`;
  return '/';
};

export const pagedLink = ({ type, id, page = 1, entityLink }) => {
  if (type === 'post' || type === 'page' || type === 'media')
    throw new Error(`Can't add a page to a ${type} entity (${type} ${id})`);
  const initialLink = entityLink || link(type, id);
  if (page === 1) return initialLink;
  if (initialLink === '/') return `/page/${page}`;
  return entityLink
    ? `${initialLink.replace(/\/$/, '')}/page/${page}`
    : `${initialLink}&paged=${page}`;
};

const common = (type, id) => ({
  mstId: join(type, id),
  id: id || null,
  type: type || null,
  ready: false,
  fetching: false,
  get link() {
    return link(type, id);
  },
  pagedLink: page => pagedLink({ type, id, page }),
});

export const headMetaShape = {
  title: '',
};

export const originalShape = {
  height: null,
  width: null,
  filename: '',
  url: '',
};

export const authorShape = (type, id) => ({
  name: '',
  slug: '',
  description: '',
  avatar: '',
  ...common(type, id),
});

export const mediaShape = (type, id) => ({
  creationDate: null,
  slug: '',
  title: '',
  caption: '',
  description: '',
  author: authorShape('author'),
  alt: '',
  mimeType: '',
  mediaType: '',
  original: originalShape,
  headMeta: headMetaShape,
  sizes: observable([]),
  ...common(type, id),
});

export const singleShape = (type, id) => ({
  title: '',
  creationDate: null,
  modificationDate: null,
  slug: '',
  content: '',
  excerpt: '',
  taxonomy: () => observable([]),
  featured: mediaShape('media'),
  author: authorShape('author'),
  target: '',
  headMeta: headMetaShape,
  parent: null,
  ...common(type, id),
});

export const taxonomyShape = (type, id) => ({
  name: '',
  slug: '',
  target: '',
  headMeta: headMetaShape,
  ...common(type, id),
});

export default (type, id) => ({
  ...mediaShape(type, id),
  ...authorShape(type, id),
  ...taxonomyShape(type, id),
  ...singleShape(type, id),
});
