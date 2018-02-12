import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';
import { connect } from 'react-redux';
import { inject } from 'mobx-react';
import { isMatch, noop } from 'lodash';
import { dep } from 'worona-deps';
import { routeChangeRequested } from '../../actions';

class RouteWaypoint extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    ssr: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    changeRoute: PropTypes.func.isRequired,
    entity: PropTypes.shape({}).isRequired,
    isNext: PropTypes.bool,
  };

  static defaultProps = {
    isNext: false,
  };

  constructor(props) {
    super(props);
    const { ssr, isNext } = this.props;
    this.state = { show: ssr || !isNext };
    this.showChildren = this.showChildren.bind(this);
    this.changeRouteFromBelow = this.changeRouteFromBelow.bind(this);
    this.changeRouteFromAbove = this.changeRouteFromAbove.bind(this);
  }

  showChildren() {
    this.setState({ show: true });
  }

  changeRouteFromBelow({ previousPosition }) {
    const { changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (previousPosition === Waypoint.below) changeRoute(entity, method);
  }

  changeRouteFromAbove({ previousPosition }) {
    const { changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (previousPosition === Waypoint.above) changeRoute(entity, method);
  }

  render() {
    const { children, ssr, active, isNext } = this.props;
    const { show } = this.state;

    if (ssr) return [children];
    if (!show)
      return [
        <Waypoint
          key="showChildren"
          scrollableAncestor={window}
          bottomOffset={-300}
          onEnter={isNext ? this.showChildren : noop}
        />,
      ];

    return [
      <Waypoint
        key="changeRouteFromBelow"
        onEnter={active ? this.changeRouteFromBelow : noop}
        bottomOffset={600}
        scrollableAncestor={window}
      />,
      children,
      <Waypoint
        key="changeRouteFromAbove"
        onEnter={active ? this.changeRouteFromAbove : noop}
        topOffset={600}
        scrollableAncestor={window}
      />,
    ];
  }
}

const mapStateToProps = state => ({
  ssr: dep('build', 'selectors', 'getSsr')(state),
});

const mapDispatchToProps = (dispatch, { selected }) => ({
  changeRoute(entity, method) {
    setTimeout(() => {
      if (!isMatch(selected, entity)) dispatch(routeChangeRequested({ selected: entity, method }));
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  inject(({ connection }) => {
    const { selected } = connection;
    return { selected };
  })(RouteWaypoint),
);
