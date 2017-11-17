import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { singleRequested, getSingle } from '../wp-api-watchers';
import * as actions from '../../actions';
// import post60 from './post-60.json';

const connection = {};

test.skip('Init saga', () => {
  const singleRequestedSaga = singleRequested(connection);
  const action = { singleType: 'post', singleId: 60 };
  return expectSaga(singleRequestedSaga, action)
    .provide([[call(getSingle, { connection, singleType: 'post', singleId: 60 }), post60]])
    .put(
      actions.singleSucceed({
        entity: {
          id: 60,
          creationDate: new Date('2016-11-25T18:31:11'),
          modificationDate: new Date('2017-10-02T14:23:48'),
          title: 'Post 60',
          slug: 'post-60-slug',
          type: 'post',
          link: 'http://example.com/post-60-slug/',
          content: '<p>Gullfoss is a waterfall located in the canyon of the Hvita</p>',
          author: 4,
          featured: 62,
          taxonomiesMap: {
            category: [3, 8],
            tag: [10],
          },
        },
      })
    )
    .run();
});
