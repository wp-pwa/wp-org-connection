/* global window */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Router from '@worona/next/router';
import NProgress from 'nprogress';
import { connect } from 'react-redux';
import { dep } from 'worona-deps';
import { injectGlobal } from 'styled-components';
import { parse } from 'url';
import * as selectors from '../../selectors';

//eslint-disable-next-line
injectGlobal`
  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: #fff;

    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;

    width: 100%;
    height: 2px;
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #fff, 0 0 5px #fff;
    opacity: 1.0;

    -webkit-transform: rotate(3deg) translate(0px, -4px);
        -ms-transform: rotate(3deg) translate(0px, -4px);
            transform: rotate(3deg) translate(0px, -4px);
  }

  #nprogress .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;

    border: solid 2px transparent;
    border-top-color: #29d;
    border-left-color: #29d;
    border-radius: 50%;

    -webkit-animation: nprogress-spinner 400ms linear infinite;
            animation: nprogress-spinner 400ms linear infinite;
  }

  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }

  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }

  @-webkit-keyframes nprogress-spinner {
    0%   { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  @keyframes nprogress-spinner {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

class Link extends Component {
  static propTypes = {
    id: PropTypes.number,
    type: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    entity: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.bool]),
    siteId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    id: 0,
    entity: false,
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
    entity: methods[type] ? selectors[methods[type]](state)[id] : false,
    siteId: dep('settings', 'selectors', 'getSiteId')(state),
  };
};

export default connect(mapStateToProps)(Link);
