import { describe, expect, it } from 'vitest';

import { postJsonLd } from './structured-data';

const post = {
  title: 'A post',
  imageUrl: 'https://example.com/og.png',
  publishedAt: new Date('2026-09-08T19:00:00Z'),
};

describe('postJsonLd', () => {
  it('gives the dates as UTC instants', () => {
    const data = JSON.parse(postJsonLd({ ...post, updatedAt: new Date('2026-10-19T12:30:00Z') }));
    expect(data.datePublished).toBe('2026-09-08T19:00:00.000Z');
    expect(data.dateModified).toBe('2026-10-19T12:30:00.000Z');
  });

  it('leaves out dateModified for a post never updated', () => {
    expect(JSON.parse(postJsonLd(post))).not.toHaveProperty('dateModified');
  });

  it('escapes `<` so the title cannot close the script element', () => {
    const json = postJsonLd({ ...post, title: '</script>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json).headline).toBe('</script>');
  });
});
