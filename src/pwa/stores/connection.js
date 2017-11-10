import { types } from 'mobx-state-tree';
import { Any } from './single';
import { List } from './list';

const Connection = types
  .model('Connection')
  .props({
    singleMap: types.optional(types.map(types.map(Any)), {}),
    listMap: types.optional(types.map(types.map(List)), {}),
  })
  .views(self => {
    const single = {};
    const list = {};
    return {
      get single() {
        self.singleMap.keys().forEach(type => {
          single[type] = single[type] || [];
          self.singleMap
            .get(type)
            .keys()
            .forEach(index => {
              if (!single[type][index]) single[type][index] = self.singleMap.get(type).get(index);
            });
        });
        return single;
      },
      get list() {
        self.listMap.keys().forEach(type => {
          list[type] = list[type] || [];
          self.listMap
            .get(type)
            .keys()
            .forEach(index => {
              if (!list[type][index]) list[type][index] = self.listMap.get(type).get(index);
            });
        });
        return list;
      },
    };
  });

export default Connection;
