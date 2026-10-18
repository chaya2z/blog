import { describe, expect, it } from 'vitest';

import { toFeedHtml } from './feed';

const pageUrl = new URL('https://example.com/en/posts/hello/');

describe('toFeedHtml', () => {
  it('resolves root-relative and relative URLs against the page', () => {
    expect(toFeedHtml('<img src="/_astro/a.webp"><a href="./b/">b</a>', pageUrl)).toBe(
      '<img src="https://example.com/_astro/a.webp"><a href="https://example.com/en/posts/hello/b/">b</a>',
    );
  });

  it('keeps fragment links on the post', () => {
    expect(toFeedHtml('<a href="#intro">Intro</a>', pageUrl)).toBe(
      '<a href="https://example.com/en/posts/hello/#intro">Intro</a>',
    );
  });

  it('normalizes absolute URLs without rebasing them', () => {
    expect(toFeedHtml('<a href="https://other.example">x</a>', pageUrl)).toBe(
      '<a href="https://other.example/">x</a>',
    );
  });

  it('resolves every candidate in srcset', () => {
    expect(toFeedHtml('<img srcset="/a.webp 1x, /b.webp 2x">', pageUrl)).toBe(
      '<img srcset="https://example.com/a.webp 1x, https://example.com/b.webp 2x">',
    );
  });

  it('drops the empty candidate a trailing comma leaves in srcset', () => {
    expect(toFeedHtml('<img srcset="/a.webp 1x,">', pageUrl)).toBe(
      '<img srcset="https://example.com/a.webp 1x">',
    );
  });

  it('keeps only the MathML half of KaTeX output', () => {
    const html =
      '<span class="katex"><span class="katex-mathml"><math></math></span>' +
      '<span class="katex-html" aria-hidden="true"><span class="base">x</span></span></span>';
    expect(toFeedHtml(html, pageUrl)).toBe(
      '<span class="katex"><span class="katex-mathml"><math></math></span></span>',
    );
  });

  it('unfolds a long note, its number at the start of the first paragraph', () => {
    const html =
      '<div class="sidenote" role="note" id="fn-a"><details><summary>' +
      '<span class="sidenote-number">1</span> <span class="sidenote-excerpt">First. Second.</span>' +
      '</summary><p>First.</p><p>Second.</p></details></div>';
    expect(toFeedHtml(html, pageUrl)).toBe(
      '<div class="sidenote" role="note" id="fn-a">' +
        '<p><span class="sidenote-number">1</span> First.</p><p>Second.</p></div>',
    );
  });
});
