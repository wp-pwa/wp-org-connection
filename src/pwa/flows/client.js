import { flow  } from 'mobx-state-tree';

export default self => flow(function* () {
  console.log('hi from client flow');
})
