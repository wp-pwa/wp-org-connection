import { dep } from 'worona-deps';

export const selectors = {
  get getURLQueries() {
    return dep('router', 'selectors', 'getURLQueries');
  },
};

export const selectorCreators = {
  get getSetting() {
    return dep('settings', 'selectorCreators', 'getSetting');
  },
};

export const types = {
  get INITIAL_PACKAGES_ACTIVATED() {
    return dep('build', 'types', 'INITIAL_PACKAGES_ACTIVATED');
  },
  get ROUTER_DID_CHANGE() {
    return dep('router', 'types', 'ROUTER_DID_CHANGE');
  },
  get DEEP_URL_VISITED() {
    return dep('router', 'types', 'DEEP_URL_VISITED');
  },
};

export const libs = {
  get push() {
    return dep('router', 'libs', 'push');
  },
};
