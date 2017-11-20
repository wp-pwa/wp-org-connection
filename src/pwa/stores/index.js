import { types } from 'mobx-state-tree';
import { Any } from './single';
import { List } from './list';
import { Custom } from './custom';
import * as actionTypes from '../actionTypes';
import convert from '../converters';

const Connection = types
  .model('Connection')
  .props({
    singleMap: types.optional(types.map(types.map(Any)), {}),
    listMap: types.optional(types.map(types.map(List)), {}),
    customMap: types.optional(types.map(types.map(Custom)), {}),
  })
  .views(self => {
    const single = {};
    const list = {
      get latest() {
        return (self.listMap.get('latest') && self.listMap.get('latest').get(0)) || null;
      },
    };
    const custom = {};
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
          if (type !== 'latest') {
            list[type] = list[type] || [];
            self.listMap
              .get(type)
              .keys()
              .forEach(index => {
                if (!list[type][index]) list[type][index] = self.listMap.get(type).get(index);
              });
          }
        });
        return list;
      },
      get custom() {
        self.customMap.keys().forEach(name => {
          custom[name] = custom[name] || [];
          self.customMap
            .get(name)
            .keys()
            .forEach(index => {
              if (!custom[name][index]) custom[name][index] = self.customMap.get(name).get(index);
            });
        });
        return custom;
      },
    };
  })
  .actions(self => {
    const addEntity = ({ type, id, entity, ready = false, fetching = false }) => {
      // Init the first map (type) if it's not initializated yet.
      if (!self.singleMap.get(type)) self.singleMap.set(type, {});
      // Create entity if it's not set and convert it if it's set.
      const newEntity = entity ? convert(entity) : { id, type };
      // Populate the state with the entity value and set both fetching and ready.
      self.singleMap.get(type).set(id, { ...newEntity, fetching, ready });
    };
    const addEntities = ({ entities, ready = true, fetching = false }) => {
      // Update the entities.
      Object.entries(entities).map(([type, single]) => {
        Object.entries(single).map(([id, entity]) => {
          addEntity({ type, id, entity, ready, fetching });
        });
      });
    };
    return {
      [actionTypes.SINGLE_REQUESTED]({ singleType, singleId }) {
        addEntity({ type: singleType, id: singleId, fetching: true });
      },
      [actionTypes.SINGLE_FAILED]({ singleType, singleId }) {
        // Populate the state with the entity value and set both fetching and ready.
        self.single[singleType][singleId].fetching = false;
      },
      [actionTypes.SINGLE_SUCCEED]({ entities }) {
        addEntities({ entities, ready: true, fetching: false });
      },
      [actionTypes.LIST_REQUESTED]({ listType, listId, page }) {
        // If we are using 'latest', listId doesn't make sense and we use always 0.
        if (listType === 'latest') listId = 0;
        // Init the first map (type) if it's not initializated yet.
        if (!self.listMap.get(listType)) self.listMap.set(listType, {});
        const list = self.listMap.get(listType);
        if (!list.get(listId)) list.set(listId, {});
        list.get(listId).fetching = true;
        if (!list.get(listId).pageMap.get(page - 1)) list.get(listId).pageMap.set(page - 1, {});
        list.get(listId).pageMap.get(page - 1).fetching = true;
      },
      [actionTypes.LIST_SUCCEED]({ listType, listId, page, total, result, entities }) {
        // If we are using 'latest', listId doesn't make sense and we use always 0.
        if (listType === 'latest') listId = 0;
        // Update the list.
        const list = self.listMap.get(listType).get(listId);
        list.fetching = false;
        list.ready = true;
        list.pageMap.get(page - 1).entities = result;
        list.pageMap.get(page - 1).fetching = false;
        list.pageMap.get(page - 1).ready = true;
        if (total) list.total = total;
        addEntities({ entities, ready: true, fetching: false });
      },
      [actionTypes.LIST_FAILED]({ listType, listId, page }) {
        // Populate the state with the entity value and set both fetching and ready.
        self.listMap.get(listType).get(listId).fetching = false;
        self.listMap
          .get(listType)
          .get(listId)
          .pageMap.get(page - 1).fetching = false;
      },
      [actionTypes.CUSTOM_REQUESTED]({ name, page }) {
        if (!self.customMap.get(name)) self.customMap.set(name, {});
        const custom = self.customMap.get(name);
        custom.fetching = true;
        debugger;
        if (!custom.pageMap.get(page - 1)) custom.pageMap.set(page - 1, {});
        custom.pageMap.get(page - 1).fetching = true;

        // if (!self.customMap.get(singleType))
      },
      [actionTypes.CUSTOM_SUCCEED](params) {
        console.log(params);
      },
      [actionTypes.CUSTOM_FAILED](params) {
        console.log(params);
      },
    };
  });

export default Connection;
