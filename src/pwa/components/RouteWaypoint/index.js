import React from 'react';
import PropTypes from 'prop-types';
import Waypoint from 'react-waypoint';
import { connect } from 'react-redux';
import { inject } from 'mobx-react';
import { isMatch, noop } from 'lodash';
import { routeChangeRequested } from '../../actions';

const RouteWaypoint = ({ children, active, changeRoute }) => (
  <Waypoint
    onEnter={active ? changeRoute : noop}
    topOffset="100px"
    bottomOffset="100px"
    scrollableAncestor="window"
  >
    {children}
  </Waypoint>
);

RouteWaypoint.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool.isRequired,
  changeRoute: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { selected, currentSelected, method }) => ({
  changeRoute() {
    if (!isMatch(selected, currentSelected)) routeChangeRequested({ selected, method });
  },
});

export default connect(undefined, mapDispatchToProps)(
  inject(({ connection }, { selected }) => {
    const { context, selected: currentSelected } = connection;
    const selectedColumn = context.getItem(selected).column;
    const method = selectedColumn === currentSelected.column ? 'replace' : 'push';
    const active = selectedColumn === context.column;
    return { currentSelected, method, active };
  })(RouteWaypoint),
);
