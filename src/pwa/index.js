import React from 'react';
import { setStatic, compose } from 'recompose';
// import * as actions from './actions';
// import * as types from './types';
// import * as components from './components';
// import sagas from './sagas/client';
// import reducers from './reducers';
// import selectors from './selectors';
// import selectorCreators from './selectorCreators';

const WpOrgConnection = () => <div>hi from wp-org</div>;

export default compose(
  // setStatic('actions', actions),
  // setStatic('types', types),
  // setStatic('components', components),
  // setStatic('sagas', sagas),
  // setStatic('reducers', reducers),
  // setStatic('selectors', selectors),
  // setStatic('selectorCreators', selectorCreators),
)(WpOrgConnection);
