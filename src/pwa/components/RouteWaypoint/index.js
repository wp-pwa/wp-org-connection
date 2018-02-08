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
    changeRoute: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.changeRouteFromBelow = this.changeRouteFromBelow.bind(this);
    this.changeRouteFromAbove = this.changeRouteFromAbove.bind(this);
  }

  changeRouteFromBelow({ previousPosition }) {
    const { changeRoute } = this.props;
    if (previousPosition === Waypoint.below) changeRoute();
  }

  changeRouteFromAbove({ previousPosition }) {
    const { changeRoute } = this.props;
    if (previousPosition === Waypoint.above) changeRoute();
  }

  render() {
    const { children, ssr, active } = this.props;
    return !ssr ? (
      <Fragment>
        <Waypoint
          onEnter={active ? this.changeRouteFromBelow : noop}
          topOffset={0}
          bottomOffset={600}
          scrollableAncestor={window}
        />
        {children}
        <Waypoint
          onEnter={active ? this.changeRouteFromAbove : noop}
          topOffset={600}
          bottomOffset={0}
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

const mapDispatchToProps = (dispatch, { selected, currentSelected, method }) => ({
  changeRoute() {
    setTimeout(() => {
      if (!isMatch(currentSelected, selected)) {
        dispatch(routeChangeRequested({ selected, method }));
      }
    })
  },
});

export default inject(({ connection }, { selected }) => {
  const { context, selected: currentSelected } = connection;
  const selectedColumn = context.getItem(selected).column;
  const method = selectedColumn === currentSelected.column ? 'replace' : 'push';
  const active = selectedColumn === context.column;
  return { currentSelected, method, active };
})(connect(mapStateToProps, mapDispatchToProps)(RouteWaypoint));
