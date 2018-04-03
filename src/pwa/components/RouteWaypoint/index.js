import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';
import { inject } from 'mobx-react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { noop } from 'lodash';
import { routeChangeRequested, moveItemToColumn } from '../../actions';

class RouteWaypoint extends Component {
  static propTypes = {
    item: PropTypes.shape({}).isRequired,
    active: PropTypes.bool.isRequired,
    event: PropTypes.shape({}),
    children: PropTypes.node.isRequired,
    moveItem: PropTypes.func.isRequired,
    changeRoute: PropTypes.func.isRequired,
    isSelectedItem: PropTypes.bool.isRequired,
    isNextNonVisited: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    event: null,
  };

  constructor(props) {
    super(props);
    this.changeRouteFromBelow = this.changeRouteFromBelow.bind(this);
    this.changeRouteFromAbove = this.changeRouteFromAbove.bind(this);
    this.changeRouteFrom = this.changeRouteFrom.bind(this);
  }

  changeRouteFromBelow(payload) {
    this.changeRouteFrom(Waypoint.below, payload);
  }

  changeRouteFromAbove(payload) {
    this.changeRouteFrom(Waypoint.above, payload);
  }

  async changeRouteFrom(position, { event: waypointEvent, previousPosition }) {
    const {
      moveItem,
      changeRoute,
      active,
      item,
      event,
      isSelectedItem,
      isNextNonVisited,
    } = this.props;

    if (waypointEvent && previousPosition === position && !isSelectedItem) {
      if (isNextNonVisited) await moveItem({ item });

      changeRoute({
        selectedItem: item,
        method: active ? 'replace' : 'push',
        event,
      });
    }
  }

  render() {
    const { children, active } = this.props;
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

const mapDispatchToProps = dispatch => ({
  moveItem(payload) {
    return new Promise(resolve => {
      setTimeout(() => {
        dispatch(moveItemToColumn(payload));
        resolve();
      });
    });
  },
  changeRoute(payload) {
    return new Promise(resolve => {
      setTimeout(() => {
        dispatch(routeChangeRequested(payload));
        resolve();
      });
    });
  },
});

export default compose(
  connect(null, mapDispatchToProps),
  inject(({ connection }, { item }) => {
    const waypointItem = connection.selectedContext.getItem({ item });
    return {
      isSelectedItem: connection.selectedItem === waypointItem,
      isInSelectedColumn: connection.selectedColumn === waypointItem.parentColumn,
      isNextNonVisited: connection.selectedContext.nextNonVisited === waypointItem,
    };
  }),
)(RouteWaypoint);
