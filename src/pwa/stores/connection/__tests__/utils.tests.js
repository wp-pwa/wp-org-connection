import { join, extract } from '../utils';

describe('Connection › Utils', () => {
  test('Join types', () => {
    expect(join('post', 60)).toBe('post_60');
    expect(join('category', 7)).toBe('category_7');
    expect(join('latest', 'post')).toBe('latest_post');
    expect(join('search', 'Some random search')).toBe('search_Some random search');
  });
  test('Extract types', () => {
    expect(extract('post_60')).toEqual({ type: 'post', id: 60 });
    expect(extract('category_7')).toEqual({ type: 'category', id: 7 });
    expect(extract('latest_post')).toEqual({ type: 'latest', id: 'post' });
    expect(extract('search_Some random search')).toEqual({
      type: 'search',
      id: 'Some random search',
    });
    expect(() => extract('post')).toThrow('Invalid type passed: post');
  });
});
