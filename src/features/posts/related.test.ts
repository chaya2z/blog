import { describe, expect, it } from 'vitest';

import { relatedPosts, type RelatablePost } from './related';

const post = (id: string, tags: string[], date = '2024-01-01'): RelatablePost => ({
  id,
  data: { tags, publishedAt: new Date(date) },
});

const ids = (posts: RelatablePost[]) => posts.map((p) => p.id);

describe('relatedPosts', () => {
  it('leaves out the post itself and posts sharing no tag', () => {
    const self = post('ja/a', ['Linux']);
    const posts = [self, post('ja/b', ['Linux']), post('ja/c', ['Blog'])];
    expect(ids(relatedPosts(self, posts))).toEqual(['ja/b']);
  });

  it('puts posts sharing more tags first', () => {
    const self = post('ja/a', ['Linux', 'Python']);
    const posts = [self, post('ja/one', ['Linux']), post('ja/two', ['Linux', 'Python'])];
    expect(ids(relatedPosts(self, posts))).toEqual(['ja/two', 'ja/one']);
  });

  it('prefers the same language, then the newest, among equals', () => {
    const self = post('ja/a', ['Linux']);
    const posts = [
      self,
      post('en/new', ['Linux'], '2025-01-01'),
      post('ja/old', ['Linux'], '2020-01-01'),
      post('ja/new', ['Linux'], '2023-01-01'),
    ];
    expect(ids(relatedPosts(self, posts))).toEqual(['ja/new', 'ja/old', 'en/new']);
  });

  it('returns at most the limit', () => {
    const self = post('ja/a', ['Linux']);
    const posts = [self, ...['b', 'c', 'd', 'e'].map((s) => post(`ja/${s}`, ['Linux']))];
    expect(relatedPosts(self, posts)).toHaveLength(3);
    expect(relatedPosts(self, posts, 2)).toHaveLength(2);
  });

  it('relates nothing to a post without tags', () => {
    const self = post('ja/a', []);
    expect(relatedPosts(self, [self, post('ja/b', ['Linux'])])).toEqual([]);
  });
});
