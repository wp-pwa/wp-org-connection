import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { isMatch, noop } from 'lodash';
import { dep } from 'worona-deps';
import { routeChangeRequested } from '../../actions';

class RouteWaypoint extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    ssr: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    changeRoute: PropTypes.func.isRequired,
    selectedItem: PropTypes.shape({}).isRequired,
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
    const { selectedItem, changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (event && previousPosition === Waypoint.below) {
      changeRoute(selectedItem, entity, method);
    }
  }

  changeRouteFromAbove({ event, previousPosition }) {
    const { selectedItem, changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (event && previousPosition === Waypoint.above) {
      changeRoute(selectedItem, entity, method);
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
  changeRoute(selectedItem, entity, method) {
    setTimeout(() => {
      if (!isMatch(selectedItem, entity)) {
        dispatch(
          routeChangeRequested({
            selectedItem: entity,
            method,
            event,
          }),
        );
      }
    });
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  inject(({ connection }) => ({
    selectedItem: connection.selectedItem,
  })),
)(RouteWaypoint);
