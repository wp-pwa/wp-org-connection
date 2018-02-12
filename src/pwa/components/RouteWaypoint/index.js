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

  changeRouteFromBelow(args) {
    const { event, previousPosition } = args;
    console.log('fromBelow', args);
    const { selected, changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (event && previousPosition === Waypoint.below) {
      console.log('CHANGING FROM BELOW', entity);
      changeRoute(selected, entity, method);
    }
  }

  changeRouteFromAbove(args) {
    const { event, previousPosition } = args;
    console.log('fromAbove', args);
    const { selected, changeRoute, entity, active, isNext } = this.props;
    const method = active || isNext ? 'replace' : 'push';
    if (event && previousPosition === Waypoint.above) {
      console.log('CHANGING FROM ABOVE', entity);
      changeRoute(selected, entity, method);
    }
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

const mapDispatchToProps = dispatch => ({
  changeRoute(selected, entity, method) {
    setTimeout(() => {
      debugger
      if (!isMatch(selected, entity)) dispatch(routeChangeRequested({ selected: entity, method }));
      else console.log('NO ROUTE CHANGE');
    });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  inject(({ connection }) => {
    const { selected } = connection;
    return { selected };
  })(RouteWaypoint),
);
