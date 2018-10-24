import { flow, getEnv } from 'mobx-state-tree';
import { decode } from 'he';
import getHeadContent from './getHeadContent';

export default self => ({
  fetchHeadContent: flow(function* fetchHeadContent() {
    try {
      self.head.hasFailed = false;
      const url = self.root.build.initialUrl;

      if (!url) throw new Error('No initial url found.');

      const { text: html } = yield getEnv(self).request(url);
      const headHtml = html.match(
        /<\s*?head[^>]*>([\w\W]+)<\s*?\/\s*?head\s*?>/,
      )[1];
      const { title, content } = getHeadContent(headHtml);

      self.head.title = decode(title);
      self.head.content = content;
    } catch (error) {
      self.head.hasFailed = true;
    }
  }),
});
