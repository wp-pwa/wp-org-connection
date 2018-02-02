import { authorShape, taxonomyShape } from './entity-shape';

const entityListShape = (type, id) => ({
  ...authorShape(type, id),
  ...taxonomyShape(type, id)
});

export const pageShape = {
  ready: false,
  fetching: false,
  entities: [],
  total: null
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
      entities: null,
      pages: null
    }
  },
  pages: [],
  page: () => pageShape,
  entities: [],
  entity: entityListShape(type, id)
});

export default listShape;
