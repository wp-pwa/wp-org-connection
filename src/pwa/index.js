import { setStatic, compose } from 'recompose';
import * as actions from './actions';
import * as types from './types';
import sagas from './sagas/client';
import reducers from './reducers';
import selectors from './selectors';
import selectorCreators from './selectorCreators';

const WpOrgConnection = () => null;

export default compose(
  setStatic('actions', actions),
  setStatic('types', types),
  setStatic('sagas', sagas),
  setStatic('reducers', reducers),
  setStatic('selectors', selectors),
  setStatic('selectorCreators', selectorCreators),
)(WpOrgConnection);
