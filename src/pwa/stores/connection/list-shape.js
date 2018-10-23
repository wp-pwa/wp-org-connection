import { observable } from 'mobx';
import { authorShape, taxonomyShape } from './entity-shape';

const entityListShape = (type, id) => ({
  ...authorShape(type, id),
  ...taxonomyShape(type, id),
});

export const pageShape = {
  isReady: false,
  isFetching: false,
  hasFailed: false,
  isEmpty: true,
  entities: observable([]),
  total: null,
};

const listShape = (type, id) => ({
  isReady: false,
  isFetching: false,
  hasFailed: false,
  isEmpty: true,
  type,
  id,
  total: {
    entities: null,
    pages: null,
    fetched: {
      entities: 0,
      pages: 0,
    },
  },
  pages: observable([]),
  page: () => pageShape,
  entities: observable([]),
  entity: entityListShape(type, id),
});

export default listShape;
