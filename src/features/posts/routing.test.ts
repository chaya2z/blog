import { describe, expect, it } from 'vitest';

import { getPostPath } from './routing';

describe('getPostPath', () => {
  it('builds the post URL with a trailing slash', () => {
    expect(getPostPath('en/hello')).toBe('/en/posts/hello/');
  });

  it('keeps slashes inside the slug', () => {
    expect(getPostPath('ja/a/b')).toBe('/ja/posts/a/b/');
  });
});
