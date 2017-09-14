/* global window */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Router from '@worona/next/router';
import NProgress from 'nprogress';
import { connect } from 'react-redux';
import { dep } from 'worona-deps';
import { parse } from 'url';
import * as selectors from '../../selectors';

class Link extends Component {
  static propTypes = {
    id: PropTypes.number,
    type: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    entity: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.null]).isRequired,
    siteId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    id: 0,
  }

  constructor(props, ...rest) {
    super(props, ...rest);
    this.linkClicked = this.linkClicked.bind(this);
    this.formatUrl = this.formatUrl.bind(this);
    this.queries = {
      post: 'p',
      page: 'page_id',
      category: 'cat',
      tag: 'tag',
      author: 'author',
      media: 'media',
      search: 's',
    };
    this.href = '/';
    this.as = '/';
    this.formatUrl();
  }

  componentWillReceiveProps() {
    this.formatUrl();
  }

  formatUrl() {
    let link = '/';

    if (this.props.entity && this.props.entity.link) link = this.props.entity.link;
    else if (this.queries[this.props.type])
      link = `/?${this.queries[this.props.type]}=${this.props.id}`;

    let query = { siteId: this.props.siteId };

    if (this.queries[this.props.type])
      query = { ...query, [this.queries[this.props.type]]: this.props.id };

    this.href = { pathname: '/', query };
    this.as = parse(link).path;
  }


  linkClicked(e) {
    if (
      e.currentTarget.nodeName === 'A' &&
      (e.metaKey || e.ctrlKey || e.shiftKey || (e.nativeEvent && e.nativeEvent.which === 2))
    ) {
      // ignore click for new tab / new window behavior
      return;
    }

    e.preventDefault();
    NProgress.start();
    setTimeout(() => Router.push(this.href, this.as), 100);
  }
  render() {
    return React.cloneElement(this.props.children, {
      onClick: this.linkClicked,
      href: this.as,
    });
  }
}

const mapStateToProps = (state, { type, id }) => {
  const methods = {
    post: 'getPostsEntities',
    page: 'getPagesEntities',
    category: 'getCategoriesEntities',
    tag: 'getTagsEntities',
    author: 'getUsersEntities',
    media: 'getMediaEntities',
  };

  return {
    entity: methods[type] ? selectors[methods[type]](state)[id] : null,
    siteId: dep('settings', 'selectors', 'getSiteId')(state),
  };
};

export default connect(mapStateToProps)(Link);
