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
    selected: PropTypes.shape({}).isRequired,
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

  changeRouteFromBelow({ event, previousPosition }) {
    const { selected, changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (event && previousPosition === Waypoint.below) {
      changeRoute(selected, entity, method);
    }
  }

  changeRouteFromAbove({ event, previousPosition }) {
    const { selected, changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (event && previousPosition === Waypoint.above) {
      changeRoute(selected, entity, method);
    }
  }

  render() {
    const { children, active, isNext } = this.props;
    const { show } = this.state;

    if (!show)
      return [
        <Waypoint
          key="showChildren"
          onEnter={isNext ? this.showChildren : noop}
          bottomOffset={-300}
          scrollableAncestor="window"
          fireOnRapidScroll={false}
        />,
      ];

    return [
      <Waypoint
        key="changeRouteFromBelow"
        onEnter={active ? this.changeRouteFromBelow : noop}
        bottomOffset={500}
        scrollableAncestor="window"
        fireOnRapidScroll={false}
      />,
      children,
      <Waypoint
        key="changeRouteFromAbove"
        onEnter={active ? this.changeRouteFromAbove : noop}
        topOffset={500}
        scrollableAncestor="window"
        fireOnRapidScroll={false}
      />,
    ];
  }
}

const mapStateToProps = state => ({
  ssr: dep('build', 'selectors', 'getSsr')(state),
});

const mapDispatchToProps = (dispatch, { event }) => ({
  changeRoute(selected, entity, method) {
    setTimeout(() => {
      if (!isMatch(selected, entity)) {
        dispatch(
          routeChangeRequested({
            selected: entity,
            method,
            event,
          }),
        );
      }
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  inject(({ connection }) => {
    const { selected } = connection;
    return { selected };
  })(RouteWaypoint),
);
