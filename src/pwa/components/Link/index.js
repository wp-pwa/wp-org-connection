import React from 'react';
import PropTypes from 'prop-types';
import NextLink from '@worona/next/link';
import { connect } from 'react-redux';
import { dep } from 'worona-deps';
import { parse } from 'url';
import * as selectors from '../../selectors';

const Link = ({ siteId, entity, type, id, children }) => {
  const queries = {
    post: 'p',
    page: 'page_id',
    category: 'cat',
    tag: 'tag',
    author: 'author',
    media: 'media',
    search: 's',
  };

  let link = '/';

  if (entity && entity.link) link = entity.link;
  else if (queries[type]) link = `/?${queries[type]}=${id}`;

  let query = {
    siteId,
  };

  if (queries[type]) query = { ...query, [queries[type]]: id };

  const href = { pathname: '/', query };
  const as = parse(link).path;

  return (
    <NextLink href={href} as={as} passHref>
      {children}
    </NextLink>
  );
};

Link.propTypes = {
  id: PropTypes.number,
  type: PropTypes.string,
  children: PropTypes.node.isRequired,
  entity: PropTypes.shape({}),
  siteId: PropTypes.string.isRequired,
};

const mapStateToProps = (state, { type, id }) => {
  const methods = {
    post: 'getPostsEntities',
    page: 'getPagesEntities',
    category: 'getCategoriesEntities',
    tags: 'getTagsEntities',
    author: 'getUsersEntities',
    media: 'getMediaEntities',
  };

  return {
    entity: methods[type] ? selectors[methods[type]](state)[id] : null,
    siteId: dep('settings', 'selectors', 'getSiteId')(state),
  };
};

export default connect(mapStateToProps)(Link);
