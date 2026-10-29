import { describe, expect, it } from 'vitest';

import {
  codePoints,
  cssContentChars,
  decodeEntities,
  formatList,
  htmlChars,
  parseList,
  unicodesArg,
} from './font-chars';

describe('decodeEntities', () => {
  it('decodes numeric and named entities', () => {
    expect(decodeEntities('a&amp;b&#x3042;&#12354;&lt;&nbsp;&copy;')).toBe('a&bああ<\u00a0©');
  });

  it('rejects a named entity it does not know', () => {
    expect(() => decodeEntities('&hellip;')).toThrow('&hellip;');
  });
});

describe('cssContentChars', () => {
  it('reads quoted strings and escapes from content declarations', () => {
    expect(cssContentChars(`a::before{content:'/' / ''}b::after{content:"\\2212 x"}`)).toBe('/−x');
  });

  it('ignores other declarations', () => {
    expect(cssContentChars(`a{font-family:"Inter";quotes:"「" "」"}`)).toBe('');
  });
});

describe('htmlChars', () => {
  it('collects text and style content strings, but not scripts', () => {
    expect(
      htmlChars(
        `<p>日本&amp;語</p><script>alert("漢")</script><style>p::before{content:'→'}</style>`,
      ),
    ).toBe('日本&語→');
  });
});

describe('codePoints', () => {
  it('sorts, dedupes and drops control characters', () => {
    expect(codePoints('ba\nあa\u0085')).toEqual([0x61, 0x62, 0x3042]);
  });
});

describe('character list', () => {
  it('round-trips through the list file', () => {
    const cps = [0x20, 0x3042, 0x20b9f];
    expect(formatList(cps)).toBe('U+0020  \nU+3042 あ\nU+20B9F 𠮟\n');
    expect(parseList(formatList(cps))).toEqual(cps);
  });

  it('formats the skera argument', () => {
    expect(unicodesArg([0x20, 0x3042])).toBe('U+0020,U+3042');
  });
});
