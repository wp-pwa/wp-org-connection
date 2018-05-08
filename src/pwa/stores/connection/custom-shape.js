import { observable } from 'mobx';
import { pageShape } from './list-shape';

export default name => ({
  isReady: false,
  isFetching: false,
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
});
