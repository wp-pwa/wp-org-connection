import { combineReducers } from 'redux';
import posts from './posts';
import categories from './categories';

export default () => combineReducers({ posts, categories })
