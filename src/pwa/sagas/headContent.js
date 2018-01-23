import { takeEvery, put, select } from 'redux-saga/effects';
import request from 'superagent';
import { parse } from 'himalaya';
import { dep } from 'worona-deps';
import * as actions from '../actions';
import * as actionTypes from '../actionTypes';

export const getHeadContent = headString => {
  const whitelist = [
    { tagName: 'meta', attributes: { name: 'description' } },
    { tagName: 'link', attributes: { rel: 'canonical' } }
  ];

  // Parses <head> content string to an array with 'himalaya'.
  const parsedHead = parse(headString);

  // Reduces parsed content to an object with an array of <meta> elements
  // and an array of <link> elements.
  const content = parsedHead.reduce(
    (result, current) => {
      const tags = whitelist.map(item => item.tagName);

      // Removes any element that has a different tag of those in the whitelist.
      if (current.type !== 'element' || !tags.includes(current.tagName)) return result;

      // Reduces current to something easier to check.
      const node = {
        tagName: current.tagName,
        attributes: current.attributes.reduce((r, c) => {
          r[c.key] = c.value;
          return r;
        }, {})
      };

      // Applies a whitelist with the content accepted.
      const passesWhitelist = whitelist.some(valid => {
        if (valid.tagName !== node.tagName) return false;

        if (valid.attributes) {
          if (node.attributes.length < 1) return false;

          const keys = Object.keys(valid.attributes);

          const sameAttributes = keys.every(key => node.attributes[key] === valid.attributes[key]);

          if (!sameAttributes) return false;
        }

        return true;
      });

      // Checks if the node passed the whitelist and if that kind of node already exists,
      // the former one is substituted by the current node.
      if (passesWhitelist) {
        if (node.tagName === 'meta') {
          const indexOfnode = result.meta.findIndex(
            item => item.attributes.name === node.attributes.name
          );

          if (indexOfnode >= 0) {
            result.meta[indexOfnode] = node;
          } else {
            result.meta.push(node);
          }
        }

        if (node.tagName === 'link') {
          const indexOfnode = result.link.findIndex(
            item => item.attributes.rel === node.attributes.rel
          );

          if (indexOfnode >= 0) {
            result.link[indexOfnode] = node;
          } else {
            result.link.push(node);
          }
        }
      }

      return result;
    },
    {
      meta: [],
      link: []
    }
  );

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
