import { types } from 'mobx-state-tree';
import { Any } from './single';
import { List } from './list';
import * as actionTypes from '../actionTypes';

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
  })
  .actions(self => {
    const addSingle = ({ type, id, entity, ready = false, fetching = false }) => {
      // Init the first map (type) if it's not initializated yet.
      if (!self.singleMap.get(type)) self.singleMap.set(type, {});
      // Create entity if it's not set
      const ent = entity || { id, type };
      // Populate the state with the entity value and set both fetching and ready.
      self.singleMap.get(type).set(id, { ...ent, fetching, ready });
    }
    return {
      [actionTypes.SINGLE_REQUESTED]({ singleType, singleId }) {
        addSingle({ type: singleType, id: singleId, fetching: true });
      },
      [actionTypes.SINGLE_FAILED]({ singleType, singleId }) {
        // Populate the state with the entity value and set both fetching and ready.
        self.single[singleType][singleId].fetching = false;
      },
      [actionTypes.SINGLE_SUCCEED]({ entity }) {
        addSingle({ type: entity.type, id: entity.id, entity, fetching: false, ready: true  });
      },
      [actionTypes.LIST_REQUESTED]({ listType, listId, page }) {
        // Init the first map (type) if it's not initializated yet.
        if (!self.listMap.get(listType)) self.listMap.set(listType, {});
        const list = self.listMap.get(listType);
        if (!list.get(listId)) list.set(listId, {});
        list.get(listId).fetching = true;
        if (!list.get(listId).pageMap.get(page)) list.get(listId).pageMap.set(page, {});
        list.get(listId).pageMap.get(page).fetching = true;
      },
      [actionTypes.LIST_SUCCEED]({ listType, listId, page, total, results, entities }) {
        // Update the list.
        const list = self.listMap.get(listType).get(listId);
        list.fetching = false;
        list.ready = true;
        list.pageMap.get(page).entities = results;
        list.pageMap.get(page).fetching = false;
        list.pageMap.get(page).ready = true;
        if (total) list.total = total;
        // Update the entities.
        Object.entries(entities).map(([type, single]) => {
          Object.entries(single).map(([id, entity]) => {
            addSingle({ type, id, entity, ready: true, fetching: false });
          });
        });
      },
      [actionTypes.LIST_FAILED]({ listType, listId, page }) {
        // Populate the state with the entity value and set both fetching and ready.
        self.listMap.get(listType).get(listId).fetching = false;
        self.listMap.get(listType).get(listId).pageMap.get(page).fetching = false;
      },
    };
  });

export default Connection;
