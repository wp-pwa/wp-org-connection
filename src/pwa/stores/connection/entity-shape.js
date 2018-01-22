export const metaShape = {
  title: '',
  description: '',
  canonical: ''
};

export const authorShape = (type, id) => ({
  id: id || null,
  type: 'author',
  ready: false,
  fetching: false,
  name: '',
  slug: '',
  description: '',
  link: id ? `/?author=${id}` : '/',
  avatar: ''
});

export const mediaShape = (type, id) => ({
  id: id || null,
  type: 'media',
  ready: false,
  fetching: false,
  creationDate: null,
  slug: '',
  title: '',
  caption: '',
  description: '',
  link: id ? `/?attachement_id=${id}` : '/',
  author: authorShape(),
  alt: '',
  mimeType: '',
  mediaType: '',
  original: {
    height: null,
    width: null,
    filename: '',
    url: ''
  },
  meta: metaShape,
  sizes: []
});

export const singleShape = {
  title: '',
  creationDate: null,
  modificationDate: null,
  slug: '',
  content: '',
  excerpt: '',
  taxonomies: () => [],
  featured: mediaShape(),
  author: authorShape(),
  target: '',
  meta: metaShape
};

export const taxonomyShape = {
  name: '',
  slug: '',
  target: '',
  meta: metaShape
};

export const link = (type, id) => {
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
  initialLink.replace(/\/$/, '/')
  if (initialLink === '/') return `/page/${page}`;
  return entityLink ? `${initialLink}page/${page}` : `${initialLink}&paged=${page}`;
};

const common = (type, id) => ({
  id: id || null,
  type: type || null,
  fetching: false,
  get link() {
    return link(type, id);
  },
  pagedLink: page => pagedLink({ type, id, page })
});

export default (type, id) => ({
  ...mediaShape(type, id),
  ...authorShape(type, id),
  ...taxonomyShape,
  ...singleShape,
  ...common(type, id)
});
