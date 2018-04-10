import { observable } from 'mobx';
import { pageShape } from './list-shape';

export default name => ({
  ready: false,
  fetching: false,
  name,
  url: '/',
  total: {
    entities: null,
    pages: null,
    fetched: {
      entities: null,
      pages: null,
    },
  },
  params: {},
  pages: observable([]),
  page: () => pageShape,
  entities: observable([]),
})
