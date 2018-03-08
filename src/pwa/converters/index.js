/* eslint-disable no-underscore-dangle */
import { decode } from 'he';

export const post = entity => ({
  id: entity.id,
  type: entity.type,
  creationDate: new Date(`${entity.date_gmt}`).getTime(),
  modificationDate: new Date(`${entity.modified_gmt}`).getTime(),
  title: entity.title.rendered,
  slug: entity.slug,
  _link: entity.link,
  guid: entity.guid.rendered,
  content: entity.content.rendered,
  excerpt: entity.excerpt && entity.excerpt.rendered,
  author: entity.author,
  featured: entity.featured_media || null,
  taxonomiesMap: entity.taxonomiesMap,
  target: entity['post-target'],
  meta: {
    title: decode(
      (entity.yoast_meta && entity.yoast_meta.yoast_wpseo_title) || entity.title.rendered,
    ),
    description: entity.yoast_meta && entity.yoast_meta.yoast_wpseo_desc,
    pretty: true,
  },
});

export const taxonomy = entity => ({
  id: entity.id,
  name: entity.name,
  slug: entity.slug,
  _link: entity.link,
  taxonomy: entity.taxonomy,
  target: entity['term-target'],
  meta: {
    title: decode((entity.yoast_meta && entity.yoast_meta.yoast_wpseo_title) || entity.name),
    description: entity.yoast_meta && entity.yoast_meta.yoast_wpseo_desc,
    pretty: true,
  },
});

export const author = entity => ({
  id: entity.id,
  name: entity.name,
  slug: entity.slug,
  description: entity.description,
  _link: entity.link,
  avatar: entity.avatar_urls && Object.values(entity.avatar_urls)[0].replace(/\?.*$/, ''),
});

export const media = entity => {
  if (entity.error) {
    return {
      id: parseInt(entity.id, 10),
      error: entity.error,
    };
  }

  return {
    id: entity.id,
    creationDate: new Date(entity.date).getTime(),
    slug: entity.slug,
    alt: entity.alt_text,
    mimeType: entity.mime_type,
    mediaType: entity.media_type,
    title: entity.title.rendered,
    author: entity.author,
    _link: entity.link,
    meta: {
      title: decode(
        (entity.yoast_meta && entity.yoast_meta.yoast_wpseo_title) || entity.title.rendered,
      ),
      description: entity.yoast_meta && entity.yoast_meta.yoast_wpseo_desc,
      pretty: true,
    },
    original: {
      height: parseInt(entity.media_details.height, 10),
      width: parseInt(entity.media_details.width, 10),
      filename: entity.media_details.file,
      url: entity.source_url,
    },
    sizes:
      entity.media_details.sizes &&
      Object.values(entity.media_details.sizes).map(image => ({
        height: parseInt(image.height, 10),
        width: parseInt(image.width, 10),
        filename: image.file,
        url: image.source_url,
      })),
  };
};

export default entity => {
  if (entity.error && entity.type === 'media') return media(entity);
  else if (entity.media_details) return media(entity);
  else if (entity.taxonomy) return taxonomy(entity);
  else if (entity.name) return author(entity);
  return post(entity);
};
