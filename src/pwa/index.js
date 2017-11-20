import React from 'react';
import * as actions from './actions';
import * as actionTypes from './actionTypes';
import reducers from './reducers';
import sagas from './sagas/client';
// import * as components from './components';
// import selectors from './selectors';
// import selectorCreators from './selectorCreators';

const WpOrgConnection = () => <div>hi from wp-org</div>;

export default WpOrgConnection;
export { actions, actionTypes, reducers, sagas };
