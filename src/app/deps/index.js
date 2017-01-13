import { dep } from 'worona-deps';

export const selectorCreators = {
  get getSetting() { return dep('settings', 'selectorCreators', 'getSetting'); },
};
