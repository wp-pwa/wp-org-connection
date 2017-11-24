/* eslint-disable no-underscore-dangle */
export const post = entity => ({
  id: entity.id,
  type: entity.type,
  creationDate: new Date(entity.date).getTime(),
  modificationDate: new Date(entity.modified).getTime(),
  title: entity.title.rendered,
  slug: entity.slug,
  link: entity.link,
  content: entity.content.rendered,
  excerpt: entity.excerpt.rendered,
  author: entity.author,
  featured: entity.featured_media,
  taxonomiesMap: entity.taxonomiesMap,
  meta: {},
});

export const taxonomy = entity => ({
  id: entity.id,
  name: entity.name,
  slug: entity.slug,
  link: entity.link,
  taxonomy: entity.taxonomy,
});

export const author = entity => ({
  id: entity.id,
  name: entity.name,
  slug: entity.slug,
  description: entity.description,
  link: entity.link,
  avatar: entity.avatar_urls && Object.values(entity.avatar_urls)[0].replace(/\?.*$/, ''),
});

export const media = entity => ({
  id: entity.id,
  creationDate: new Date(entity.date).getTime(),
  slug: entity.slug,
  alt: entity.alt_text,
  mimeType: entity.mime_type,
  mediaType: entity.media_type,
  title: entity.title.rendered,
  author: entity.author,
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
  if (entity.media_details) return media(entity);
  else if (entity.taxonomy) return taxonomy(entity);
  else if (entity.name) return author(entity);
  return post(entity);
};
