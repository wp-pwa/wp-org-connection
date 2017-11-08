import { types } from 'mobx-state-tree';

export const Author = types.model('Author').props({});

export const Media = types.model('Media').props({});

export const Featured = types.model('Featured').props({
  media: types.reference(Media),
  caption: types.string,
});

export const Category = types.model('Category').props({
  
});

export const Taxonomies = types.model('Taxonomies').props({
  category: types.array(types.reference(Category)),
  tag: types.array(types.reference(Tag)),
});

export const Single = types.model('Post').props({
  id: types.number,
  creationDate: types.string,
  modificationDate: types.string,
  title: types.string,
  slug: types.string,
  type: types.string,
  link: types.string,
  content: types.string,
  excerpt: types.string,
  author: types.reference(Author),
  featured: Featured,
  taxonomies: Taxonomies,
});

export const Entities = types.model('Entities').props({
  post: types.array(Post),
  page: types.array(Entity),
  category: types.array(Entity),
  tag: types.array(Entity),
  author: types.array(Entity),
});

export const Connection = types.model('Connection').props({
  entities: Entities,
});
