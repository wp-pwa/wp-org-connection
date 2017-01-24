import { flow, mapValues, mapKeys } from 'lodash/fp';
import { capitalize } from 'lodash';
import { wpTypes } from '../constants';

const mapValuesWithKey = mapValues.convert({ cap: false });

const getParams = flow(
  mapValuesWithKey((value, key) => state => state.connection.params[key]),
  mapKeys(key => `get${capitalize(key)}Params`),
)(wpTypes);

module.exports = {
  ...getParams,
}
