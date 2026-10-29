import { ELEMENT_NODE, parse, TEXT_NODE, walkSync } from 'ultrahtml';

/*
 * The characters a build draws with its web fonts, and the list file that
 * records which of them a font subset holds.
 */

// The entities Astro escapes with, and those the templates are written with.
// Any other fails loudly rather than leaving its character out of the subset.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '\u00a9',
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X';
      return String.fromCodePoint(Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    if (named === undefined) {
      throw new Error(`Unknown HTML entity ${entity}: add it to NAMED_ENTITIES in font-chars.ts`);
    }
    return named;
  });
}

/** Characters in CSS `content` strings, which pseudo-elements draw. */
export function cssContentChars(css: string): string {
  let chars = '';
  for (const declaration of css.matchAll(/content\s*:([^;}]*)/g)) {
    for (const [, , value] of declaration[1].matchAll(/(["'])((?:\\.|(?!\1).)*)\1/g)) {
      chars += value.replace(/\\([0-9a-f]{1,6})\s?|\\(.)/gi, (_, hex?: string, char?: string) =>
        hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : (char ?? ''),
      );
    }
  }
  return chars;
}

/** Characters of a page's text and of the `content` strings in its `<style>` elements. */
export function htmlChars(html: string): string {
  let chars = '';
  walkSync(parse(html), (node, parent) => {
    if (node.type !== TEXT_NODE || parent?.type !== ELEMENT_NODE) return;
    if (parent.name === 'style') chars += cssContentChars(node.value);
    else if (parent.name !== 'script') chars += decodeEntities(node.value);
  });
  return chars;
}

/** Code points of `text`, without control characters, sorted and unique. */
export function codePoints(text: string): number[] {
  const set = new Set<number>();
  for (const char of text) {
    const cp = char.codePointAt(0)!;
    if (cp > 0x1f && (cp < 0x7f || cp > 0x9f)) set.add(cp);
  }
  return [...set].toSorted((a, b) => a - b);
}

const hex = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

/** One `U+XXXX <char>` line per code point, so a diff shows each change. */
export function formatList(cps: number[]): string {
  return cps.map((cp) => `${hex(cp)} ${String.fromCodePoint(cp)}\n`).join('');
}

export function parseList(text: string): number[] {
  return text
    .split('\n')
    .filter((line) => line !== '')
    .map((line) => {
      const match = /^U\+([0-9A-F]{4,6}) /.exec(line);
      if (!match) throw new Error(`Bad line in character list: ${JSON.stringify(line)}`);
      return Number.parseInt(match[1], 16);
    });
}

/** skera's `--unicodes` value. */
export function unicodesArg(cps: number[]): string {
  return cps.map(hex).join(',');
}
