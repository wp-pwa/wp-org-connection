/* eslint-disable no-underscore-dangle */
import { decode } from 'he';

export const single = entity => ({
  mst: 'single',
  id: entity.id,
  type: entity.type,
  creationDate: new Date(entity.date).getTime(),
  modificationDate: new Date(entity.modified).getTime(),
  title: entity.title.rendered,
  slug: entity.slug,
  link: entity.link,
  content: entity.content.rendered,
  excerpt: entity.excerpt && entity.excerpt.rendered,
  author: entity.author,
  featured: entity.featured_media || null,
  taxonomies: entity.taxonomiesMap,
  parent: entity.parent,
  target: entity['post-target'],
  headMeta: {
    title: decode((entity.yoast_meta && entity.yoast_meta.title) || entity.title.rendered),
  },
});

export const taxonomy = entity => ({
  mst: 'taxonomy',
  id: entity.id,
  name: entity.name,
  slug: entity.slug,
  link: entity.link,
  type: entity.type,
  target: entity['term-target'],
  headMeta: {
    title: (entity.yoast_meta && entity.yoast_meta.title) || entity.name,
  },
});

export const author = entity => ({
  mst: 'author',
  type: 'author',
  id: entity.id,
  name: entity.name,
  slug: entity.slug,
  description: entity.description,
  link: entity.link,
  avatar: entity.avatar_urls && Object.values(entity.avatar_urls)[0].replace(/\?.*$/, ''),
});

export const media = entity => ({
  mst: 'media',
  id: entity.id,
  type: 'media',
  creationDate: new Date(`${entity.date_gmt}+0000`).getTime(),
  slug: entity.slug,
  alt: entity.alt_text,
  link: entity.link,
  mimeType: entity.mime_type,
  mediaType: entity.media_type,
  title: entity.title.rendered,
  description: entity.description && entity.description.rendered,
  caption: entity.caption && entity.caption.rendered,
  author: entity.author,
  headMeta: {
    title: decode((entity.yoast_meta && entity.yoast_meta.title) || entity.title.rendered),
  },
  original: {
    height: entity.media_details.height,
    width: entity.media_details.width,
    filename: entity.media_details.file,
    url: entity.source_url,
  },
  sizes:
    entity.media_details.sizes &&
    Object.values(entity.media_details.sizes).map(image => ({
      height: image.height,
      width: image.width,
      filename: image.file,
      url: image.source_url,
    })),
});

export default entity => {
  if (entity.mst === 'media') return media(entity);
  else if (entity.mst === 'taxonomy') return taxonomy(entity);
  else if (entity.mst === 'author') return author(entity);
  return single(entity);
};
