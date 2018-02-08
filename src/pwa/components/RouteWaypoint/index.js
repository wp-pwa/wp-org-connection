import React, { Component, Fragment } from 'react';
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
    selected: PropTypes.shape({}).isRequired,
    next: PropTypes.shape({}).isRequired,
    changeRoute: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.changeRouteFromBelow = this.changeRouteFromBelow.bind(this);
    this.changeRouteFromAbove = this.changeRouteFromAbove.bind(this);
  }

  changeRouteFromBelow({ previousPosition }) {
    const { changeRoute, next } = this.props;
    if (next && previousPosition === Waypoint.below) changeRoute(next);
  }

  changeRouteFromAbove({ previousPosition }) {
    const { changeRoute, selected } = this.props;
    if (previousPosition === Waypoint.above) changeRoute(selected);
  }

  render() {
    const { children, ssr, active } = this.props;
    return !ssr ? (
      <Fragment>
        {children}
        <Waypoint
          onEnter={active ? this.changeRouteFromAbove : noop}
          topOffset={600}
          bottomOffset={0}
          scrollableAncestor={window}
        />
        <Waypoint
          onEnter={active ? this.changeRouteFromBelow : noop}
          topOffset={0}
          bottomOffset={-1}
          scrollableAncestor={window}
        />
      </Fragment>
    ) : (
      children
    );
  }
}

const mapStateToProps = state => ({
  ssr: dep('build', 'selectors', 'getSsr')(state),
});

const mapDispatchToProps = (dispatch, { currentSelected, method }) => ({
  changeRoute({ singleType, singleId }) {
    setTimeout(() => {
      if (!isMatch(currentSelected, { singleType, singleId })) {
        dispatch(routeChangeRequested({ selected: { singleType, singleId }, method }));
      }
    })
  },
});

export default inject(({ connection }, { selected }) => {
  const { context, selected: currentSelected } = connection;
  const { column: selectedColumn, next } = context.getItem(selected);
  const method = selectedColumn === currentSelected.column ? 'replace' : 'push';
  const active = selectedColumn === context.column;
  return { currentSelected, next, method, active };
})(connect(mapStateToProps, mapDispatchToProps)(RouteWaypoint));
