import React from 'react';
import PropTypes from 'prop-types';
import NextLink from '@worona/next/link';
import { connect } from 'react-redux';
import { dep } from 'worona-deps';
import { parse } from 'url';
import * as selectors from '../../selectors';

const Link = ({ query, id = 0, children, siteId, as }) =>
  <NextLink href={{ pathname: '/', query: { [query]: id, siteId } }} as={as} passHref>
    {children}
  </NextLink>;
Link.propTypes = {
  type: PropTypes.string.isRequired,
  id: PropTypes.number,
  children: PropTypes.node.isRequired,
  siteId: PropTypes.node.isRequired,
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

  return {
    siteId: dep('settings', 'selectors', 'getSiteId')(state),
    as: parse(link).path,
    query: entities[type] && entities[type].query,
  };
};

export default connect(mapStateToProps)(Link);
