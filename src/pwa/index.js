import { setStatic, compose } from 'recompose';
import * as actions from './actions';
import * as types from './types';
import * as components from './components';
import * as constants from './constants';
import sagas from './sagas/client';
import reducers from './reducers';
import selectors from './selectors';
import selectorCreators from './selectorCreators';

const WpOrgConnection = () => null;

export default compose(
  setStatic('actions', actions),
  setStatic('types', types),
  setStatic('components', components),
  setStatic('sagas', sagas),
  setStatic('reducers', reducers),
  setStatic('selectors', selectors),
  setStatic('selectorCreators', selectorCreators),
  setStatic('constants', constants),
)(WpOrgConnection);
