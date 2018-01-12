const author = {
  ready: false,
  fetching: false,
  id: null,
  type: 'author',
  name: null,
  slug: null,
  description: null,
  link: null,
  avatar: null,
};

const media = {
  ready: false,
  fetching: false,
  id: null,
  type: 'media',
  creationDate: null,
  slug: null,
  title: null,
  author,
  alt: null,
  mimeType: null,
  mediaType: null,
  original: {
    height: null,
    width: null,
    filename: null,
    url: null,
  },
  sizes: [],
};

const meta = {
  title: null,
  description: null,
  canonical: null,
};

const single = {
  ready: false,
  fetching: false,
  type: null,
  id: null,
  title: null,
  creationDate: null,
  modificationDate: null,
  slug: null,
  content: null,
  excerpt: null,
  link: null,
  taxonomies: [],
  featured: media,
  author,
  target: null,
  meta,
};

const taxonomy = {
  ready: false,
  fetching: false,
  id: null,
  type: null,
  name: null,
  slug: null,
  link: null,
  target: null,
  meta,
};

export default {
  ...media,
  ...author,
  ...taxonomy,
  ...single,
};
