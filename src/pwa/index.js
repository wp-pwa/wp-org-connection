import React from 'react';
import { setStatic, compose } from 'recompose';
// import actions from './actions';
// import types from './types';
// import sagas from './sagas';
import reducers from './reducers';
// import selectors from './selectors';
// import selectorCreators from './selectorCreators';

const WpOrgConnection = () => null;

export default compose(
  // setStatic('actions', actions),
  // setStatic('types', types),
  // setStatic('sagas', sagas),
  setStatic('reducers', reducers),
  // setStatic('selectors', selectors),
  // setStatic('selectorCreators', selectorCreators),
)(WpOrgConnection);
