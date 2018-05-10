import { flow } from 'mobx-state-tree';
import asciify from 'asciify';

export default self =>
  flow(function* ServerConnection() {
    const asciifyPromise = txt =>
      new Promise((resolve, reject) => {
        asciify(txt, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    const awesome = yield asciifyPromise('Frontity!');
    console.log(awesome);
  });
