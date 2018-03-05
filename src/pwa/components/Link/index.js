/* global window */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NProgress from 'nprogress';
import { compose } from 'recompose';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { dep } from 'worona-deps';
import { injectGlobal } from 'react-emotion';

// eslint-disable-next-line
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
    selected: PropTypes.shape({
      singleType: PropTypes.string,
      singleId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      listType: PropTypes.string,
      listId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      page: PropTypes.number,
    }).isRequired,
    context: PropTypes.shape({}),
    method: PropTypes.string,
    event: PropTypes.shape({}),
    children: PropTypes.node.isRequired,
    href: PropTypes.string.isRequired,
    routeChangeRequested: PropTypes.func.isRequired,
  };

  static defaultProps = {
    method: 'push',
    context: null,
    event: null,
  };

  constructor(props, ...rest) {
    super(props, ...rest);
    this.linkClicked = this.linkClicked.bind(this);
  }

  linkClicked(e) {
    // ignore click for new tab / new window behavior
    if (
      e.currentTarget.nodeName === 'A' &&
      (e.metaKey || e.ctrlKey || e.shiftKey || (e.nativeEvent && e.nativeEvent.which === 2))
    )
      return;
    e.preventDefault();
    NProgress.start();

    const { routeChangeRequested, selected, context, method, event } = this.props;
    setTimeout(() => routeChangeRequested({ selected, context, method, event }), 100);
  }

  render() {
    const { children, href } = this.props;
    return React.cloneElement(children, { onClick: this.linkClicked, href });
  }
}

const mapDispatchToProps = dispatch => ({
  routeChangeRequested: payload =>
    dispatch(dep('connection', 'actions', 'routeChangeRequested')(payload)),
});

export default compose(
  inject(({ connection }, { selected }) => {
    const { singleType, singleId, listType, listId, page } = selected;
    const type = listType || singleType;
    const id = listType ? listId : singleId;
    let href = '/';
    if (type === 'latest') href = page > 1 ? `/page/${page}` : '/';
    else if (connection.single[type] && connection.single[type][id]) {
      const { link } = connection.single[type][id];
      href = page > 1 ? link.paged(1) : link.url;
    }
    return { href };
  }),
  connect(null, mapDispatchToProps),
)(Link);
