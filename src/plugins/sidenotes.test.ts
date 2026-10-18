import { markdownToHtml } from 'satteri';
import { describe, expect, it } from 'vitest';

import { sidenotesPlugin } from './sidenotes';

const render = (markdown: string) =>
  markdownToHtml(markdown, { hastPlugins: [sidenotesPlugin] }).html;

// The notes of the first noted block, from a page with one.
const notesOf = (html: string) =>
  html.slice(html.indexOf('<div class="sidenotes">'), html.lastIndexOf('</div></div>'));

describe('sidenotesPlugin', () => {
  it('leaves a post without footnotes alone', () => {
    const markdown = 'A paragraph.\n';
    expect(render(markdown)).toBe(markdownToHtml(markdown).html);
  });

  it('puts the note after the block that refers to it, in a shared wrapper', () => {
    const html = render('First.\n\nSecond.[^a]\n\n[^a]: The note.\n');
    expect(html).toMatch(
      /<p>First\.<\/p>\s*<div class="noted"><p>Second\..*<\/p><div class="sidenotes"><div class="sidenote" role="note" id="user-content-fn-a"><p><span class="sidenote-number">1<\/span> The note\.<\/p><\/div><\/div><\/div>/,
    );
  });

  it('keeps the reference linked to the note', () => {
    const html = render('Text.[^a]\n\n[^a]: The note.\n');
    expect(html).toContain('href="#user-content-fn-a"');
    expect(html.match(/id="user-content-fn-a"/g)).toHaveLength(1);
  });

  it('drops the list at the end, and the label references point to', () => {
    const html = render('Text.[^a]\n\n[^a]: The note.\n');
    expect(html).not.toContain('<section data-footnotes');
    expect(html).not.toContain('aria-describedby');
  });

  it('gives a footnote referred to twice one note, by the first reference', () => {
    const html = render('One.[^a]\n\nTwo.[^a]\n\n[^a]: The note.\n');
    expect(html.match(/class="sidenote"/g)).toHaveLength(1);
    expect(html.indexOf('class="sidenote"')).toBeLessThan(html.indexOf('Two.'));
  });

  it('sets every note of a block after it, in order', () => {
    const notes = notesOf(render('Text.[^a] More.[^b]\n\n[^a]: First.\n[^b]: Second.\n'));
    expect(notes.indexOf('First.')).toBeLessThan(notes.indexOf('Second.'));
  });

  it('drops the links back to the references', () => {
    const notes = notesOf(render('One.[^a] Two.[^a]\n\n[^a]: The note.\n'));
    expect(notes).not.toContain('data-footnote-backref');
    expect(notes).toContain('The note.</p>');
  });

  it('keeps every paragraph of a long note', () => {
    const notes = notesOf(render('Text.[^a]\n\n[^a]: First.\n\n    Second.\n'));
    expect(notes).toContain('<span class="sidenote-number">1</span> First.</p><p>Second.</p>');
  });

  it('keeps a list, and drops the link back after it', () => {
    const notes = notesOf(render('Text.[^a]\n\n[^a]: Intro:\n\n    - one\n    - two\n'));
    expect(notes).toMatch(
      /<p><span class="sidenote-number">1<\/span> Intro:<\/p><ul>\s*<li>one<\/li>/,
    );
    expect(notes).not.toContain('<p><li>');
    expect(notes).not.toContain('data-footnote-backref');
  });

  it('keeps a code block', () => {
    const notes = notesOf(render('Text.[^a]\n\n[^a]: See:\n\n    ```\n    code here\n    ```\n'));
    expect(notes).toContain('<pre><code>code here');
  });

  it('sets the number before a first block that is not a paragraph', () => {
    const notes = notesOf(render('Text.[^a]\n\n[^a]: > quoted\n'));
    expect(notes).toMatch(/<span class="sidenote-number">1<\/span><blockquote>\s*<p>quoted<\/p>/);
  });

  it('notes a reference inside a list beside the whole list', () => {
    const html = render('- one\n- two[^a]\n\n[^a]: The note.\n');
    expect(html).toMatch(/<div class="noted"><ul>[\s\S]*<\/ul><div class="sidenotes">/);
  });

  it('keeps a source open, however long its URL', () => {
    const url = `https://example.com/${'a'.repeat(200)}`;
    const notes = notesOf(render(`Text.[^a]\n\n[^a]: Source: <${url}>\n`));
    expect(notes).not.toContain('<details>');
    expect(notes).toContain('<span class="sidenote-number">1</span> Source:');
  });

  it('folds a long note, its number and plain text in the summary', () => {
    const definition = '用語の定義を文章で説明する長い注釈。'.repeat(4);
    const notes = notesOf(
      render(`Text.[^a]\n\n[^a]: ${definition} [Link](https://example.com).\n`),
    );
    expect(notes).toMatch(
      /<div class="sidenote" role="note" id="user-content-fn-a"><details><summary><span class="sidenote-number">1<\/span> <span class="sidenote-excerpt">用語の定義/,
    );
    expect(notes).toContain('Link.</span></summary><p>用語の定義');
    expect(notes).toContain('<a href="https://example.com">Link</a>.</p></details>');
  });

  it('keeps in the list a footnote only another footnote cites', () => {
    const html = render('Text.[^a]\n\n[^a]: See [^b].\n[^b]: Inner.\n');
    expect(html).toContain('<section data-footnotes');
    expect(html.match(/id="user-content-fn-a"/g)).toHaveLength(1);
    expect(html).toMatch(/<li id="user-content-fn-b">/);
  });
});
