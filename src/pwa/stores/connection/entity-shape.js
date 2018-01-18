const author = {
  ready: false,
  fetching: false,
  id: null,
  type: 'author',
  name: '',
  slug: '',
  description: '',
  link: '/',
  avatar: '',
};

const meta = {
  title: '',
  description: '',
  canonical: '',
};

const media = {
  ready: false,
  fetching: false,
  id: null,
  type: 'media',
  creationDate: null,
  slug: '',
  title: '',
  caption: '',
  description: '',
  link: '/',
  author,
  alt: '',
  mimeType: '',
  mediaType: '',
  original: {
    height: null,
    width: null,
    filename: '',
    url: '',
  },
  meta,
  sizes: [],
};

const single = {
  ready: false,
  fetching: false,
  type: null,
  id: null,
  title: '',
  creationDate: null,
  modificationDate: null,
  slug: '',
  content: '',
  excerpt: '',
  link: '/',
  taxonomies: [],
  featured: media,
  author,
  target: '',
  meta,
};

const taxonomy = {
  ready: false,
  fetching: false,
  id: null,
  type: null,
  name: '',
  slug: '',
  link: '/',
  target: '',
  meta,
};

export default {
  ...media,
  ...author,
  ...taxonomy,
  ...single,
};
