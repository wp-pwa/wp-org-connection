import React from 'react';
import PropTypes from 'prop-types';
import NextLink from '@worona/next/link';
import { connect } from 'react-redux';
import { dep } from 'worona-deps';
import { parse } from 'url';
import * as selectors from '../../selectors';

const Link = ({ href, children, as }) =>
  <NextLink href={href} as={as} passHref>
    {children}
  </NextLink>;
Link.propTypes = {
  href: PropTypes.shape().isRequired,
  children: PropTypes.node.isRequired,
  as: PropTypes.string.isRequired,
};

const mapStateToProps = (state, { type, id }) => {
  const entities = {
    post: { selector: 'getPostsEntities', query: 'p' },
    page: { selector: 'getPagesEntities', query: 'page_id' },
    category: { selector: 'getCategoriesEntities', query: 'cat' },
    tag: { selector: 'getTagsEntities', query: 'tag' },
    author: { selector: 'getUsersEntities', query: 'author' },
    media: { selector: 'getAttachmentsEntities', query: 'media' },
    search: { query: 's' },
  };

  let link = '/';
  if (entities[type]) {
    const selector = entities[type].selector;
    const entity = selectors[selector](state)[id];
    if (entity && entity.link) link = entity.link;
    else link = `/?${entities[type].query}=${id}`;
  } else if (type === 'search') link = `/?s=${id}`;

  const siteId = dep('settings', 'selectors', 'getSiteId')(state);
  const props = {
    as: parse(link).path,
    href: { pathname: '/', query: { siteId } },
  };
  if (type !== 'latest') props.href.query = { [entities[type].query]: id, siteId };
  return props;
};

export default connect(mapStateToProps)(Link);
