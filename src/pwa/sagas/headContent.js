import { takeEvery, put, select } from 'redux-saga/effects';
import request from 'superagent';
import { parse } from 'himalaya';
import { format, parse as urlparser } from 'url';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';
import whitelist from './whitelist';

const allowedTags = new Set(whitelist.map(item => item.tagName));

export const getHeadContent = headString => {
  // Parses <head> content string to an array with 'himalaya'.
  const parsedHead = parse(headString);

  // Filters out anything different than the tags allowed on the whitelist (currently <meta> and <link>).
  const filteredHead = parsedHead.filter(
    node => node.type === 'element' && allowedTags.has(node.tagName),
  );

  // Maps nodes into something easier to read.
  const mappedHead = filteredHead.map(node => ({
    tagName: node.tagName,
    attributes: node.attributes.reduce((r, c) => {
      r[c.key] = c.value;
      return r;
    }, {}),
    children: node.tagName === 'title' ? node.children : null,
  }));

  // Reduces parsed content to an object with an array of <meta> elements
  // and an array of <link> elements.
  const content = mappedHead.reduce((result, node) => {
    // Applies a whitelist with the content accepted.
    const passesWhitelist = whitelist.some(valid => {
      if (valid.tagName !== node.tagName) return false;

      if (valid.attributes) {
        if (node.attributes.length < 1) return false;

        const keys = Object.keys(valid.attributes);
        const sameAttributes = keys.every(key => node.attributes[key] === valid.attributes[key]);

        if (!sameAttributes) return false;

        // Assigns unique and permanent values (if needed) for future interactions.
        if (valid.unique) node.unique = true;
        if (valid.permanent) node.permanent = true;
      }

      return true;
    });

    const getIndex = (n, r) => {
      if (r[n.tagName].length > 0) {
        if (n.tagName === 'meta') {
          return r.meta.findIndex(
            item =>
              (item.attributes.name && item.attributes.name === n.attributes.name) ||
              (item.attributes.property && item.attributes.property === n.attributes.property),
          );
        } else if (n.tagName === 'link') {
          return r.link.findIndex(item => item.attributes.rel === n.attributes.rel);
        }
      }

      return -1;
    };

    // Checks that the node passed the whitelist. If none of its kind
    // is already in the result, pushes the node.
    if (passesWhitelist) {
      // Initializes tag array.
      if (!result[node.tagName]) result[node.tagName] = [];

      // Checks if node should be unique and if already exists in result.
      if (node.unique && getIndex(node, result) >= 0) return result;

      // Pushes node into tag array.
      result[node.tagName].push(node);
    }

    return result;
  }, {});

  return {
    title: content.title && content.title[0].children && content.title[0].children[0].content,
    content: Object.keys(content).reduce((result, key) => {
      if (key !== 'title') return result.concat(content[key]);
      return result;
    }, []),
  };
};

export const headContentRequested = () =>
  function* headContentRequestedSaga() {
    try {
      let url = yield select(dep('build', 'selectors', 'getInitialUrl'));
      if (!url) throw new Error('No initial url found.');
      if (!urlparser(url).host || !urlparser(url).protocol) {
        const siteUrl = yield select(
          dep('settings', 'selectorCreators', 'getSetting')('generalSite', 'url'),
        );
        const { protocol, host } = urlparser(siteUrl);
        url = format({ protocol, host, pathname: url });
      }
      const site = yield request(url);
      const headString = site.text.match(/<\s*?head[^>]*>([\w\W]+)<\s*?\/\s*?head\s*?>/)[1];
      const { title, content } = getHeadContent(headString);

      yield put(
        actions.headContentSucceed({
          title,
          content,
        }),
      );
    } catch (error) {
      yield put(actions.headContentFailed({ error }));
    }
  };

export default function* headContentWatcher() {
  yield takeEvery(actionTypes.HEAD_CONTENT_REQUESTED, headContentRequested());
}
