import { observable } from 'mobx';
import { authorShape, taxonomyShape } from './entity-shape';

const entityListShape = (type, id) => ({
  ...authorShape(type, id),
  ...taxonomyShape(type, id),
});

export const pageShape = {
  ready: false,
  fetching: false,
  entities: observable([]),
  total: null,
};

const listShape = (type, id) => ({
  ready: false,
  fetching: false,
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
