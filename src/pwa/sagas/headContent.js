import { takeEvery, put, select } from 'redux-saga/effects';
import request from 'superagent';
import { parse } from 'himalaya';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';
import whitelist from './whitelist.json';

const allowedTags = new Set(whitelist.map(item => item.tagName));

export const getHeadContent = headString => {
  // Parses <head> content string to an array with 'himalaya'.
  const parsedHead = parse(headString);

  // Filters out anything different than the tags allowed on the whitelist (currently <meta> and <link>).
  const filteredHead = parsedHead.filter(
    node => node.type === 'element' && allowedTags.has(node.tagName)
  );

  // Maps nodes into something easier to read.
  const mappedHead = filteredHead.map(node => ({
    tagName: node.tagName,
    attributes: node.attributes.reduce((r, c) => {
      r[c.key] = c.value;
      return r;
    }, {})
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

    const getIndexOfNode = n => {
      if (result[n.tagName].length > 0) {
        if (n.tagName === 'meta') {
          return result.meta.findIndex(
            item =>
              item.attributes.name === n.attributes.name ||
              item.attributes.property === n.attributes.property
          );
        } else if (n.tagName === 'link') {
          return result.link.findIndex(item => item.attributes.rel === n.attributes.rel);
        }
      }

      return -1;
    };

    // Checks if the node passed the whitelist. If that kind of node already exists,
    // the former one is substituted by the current node.
    if (passesWhitelist) {
      // Initializes tag array.
      if (!result[node.tagName]) result[node.tagName] = [];

      const index = getIndexOfNode(node);

      if (node.unique && index >= 0) {
        result[node.tagName][index] = node;
      } else {
        // Pushes node into tag array.
        result[node.tagName].push(node);
      }
    }

    return result;
  }, {});

  return Object.keys(content).reduce((result, key) => result.concat(content[key]), []);
};

export const headContentRequested = () =>
  function* headContentRequestedSaga() {
    try {
      const url = yield select(dep('build', 'selectors', 'getInitialUrl'));
      const site = yield request(url);
      const headString = site.text.match(/<head>([\w\W]+)<\/head>/)[1];
      const headContent = getHeadContent(headString);

      yield put(
        actions.headContentSucceed({
          content: headContent
        })
      );
    } catch (error) {
      yield put(actions.headContentFailed({ error }));
    }
  };

export default function* headContentWatcher() {
  yield takeEvery(actionTypes.HEAD_CONTENT_REQUESTED, headContentRequested());
}
