import { describe, expect, it } from 'vitest';

import { postBreadcrumbJsonLd, postJsonLd } from './structured-data';

const post = {
  title: 'A post',
  description: 'What the post is about.',
  lang: 'ja',
  tags: ['Linux'],
  imageUrl: 'https://example.com/og.png',
  publishedAt: new Date('2026-09-08T19:00:00Z'),
};

describe('postJsonLd', () => {
  it('gives the dates as UTC instants', () => {
    const data = postJsonLd({ ...post, updatedAt: new Date('2026-10-19T12:30:00Z') });
    expect(data.datePublished).toBe('2026-09-08T19:00:00Z');
    expect(data.dateModified).toBe('2026-10-19T12:30:00Z');
  });

  it('leaves out dateModified for a post never updated', () => {
    expect(postJsonLd(post)).not.toHaveProperty('dateModified');
  });
});

describe('postBreadcrumbJsonLd', () => {
  it('links Home and Posts, and leaves the post to its own page', () => {
    const data = postBreadcrumbJsonLd({ title: 'A post', siteUrl: new URL('https://example.com') });
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
      { '@type': 'ListItem', position: 2, name: 'Posts', item: 'https://example.com/posts/' },
      { '@type': 'ListItem', position: 3, name: 'A post' },
    ]);
  });
});
