import { describe, expect, it } from 'vitest';

import { parsePostId } from './id';

describe('parsePostId', () => {
  it('splits a simple id into lang and slug', () => {
    expect(parsePostId('en/hello')).toEqual({ lang: 'en', slug: 'hello' });
  });

  it('keeps slashes inside the slug', () => {
    expect(parsePostId('en/a/b')).toEqual({ lang: 'en', slug: 'a/b' });
  });

  it('throws for an unsupported language', () => {
    expect(() => parsePostId('fr/hello')).toThrow('Invalid post id "fr/hello"');
  });

  it('throws when the slug is empty', () => {
    expect(() => parsePostId('en/')).toThrow('Invalid post id "en/"');
  });
});
