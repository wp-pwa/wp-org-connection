import { types } from 'mobx-state-tree';
import uuid from 'uuid/v4';


export default types.optional(types.identifier(types.string), uuid);
