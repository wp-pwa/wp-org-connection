import { dep } from 'worona-deps';

export const selectorCreators = {
  get getSetting() {
    return dep('settings', 'selectorCreators', 'getSetting');
  },
};

export const types = {
  get INITIAL_PACKAGES_ACTIVATED() {
    return dep('build', 'types', 'INITIAL_PACKAGES_ACTIVATED');
  },
};
