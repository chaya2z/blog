import { describe, expect, it } from 'vitest';

import { drawInlinePattern } from './inline-pattern';
import { PATTERN_NAMES, patternNameFor } from './patterns';

// Post ids that get the pattern, found by trying ids in turn.
const idsFor = (name: string, count: number) => {
  const found: string[] = [];
  for (let i = 0; found.length < count; i++) {
    if (patternNameFor(`ja/post-${i}`) === name) found.push(`ja/post-${i}`);
  }
  return found;
};
const idFor = (name: string) => idsFor(name, 1)[0]!;

const idsIn = (svg: string) => [...svg.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);

describe('drawInlinePattern', () => {
  it.each(PATTERN_NAMES)('points every reference in %s at its own prefixed id', (name) => {
    const svg = drawInlinePattern(idFor(name));
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) {
      expect(ref.startsWith('art-')).toBe(true);
      expect(svg).toContain(`id="${ref}"`);
    }
  });

  it('gives two posts with the same pattern different ids', () => {
    const [a, b] = idsFor('moire', 2) as [string, string];
    expect(idsIn(drawInlinePattern(a))).not.toEqual(idsIn(drawInlinePattern(b)));
  });

  it('keeps ids apart for post ids that differ only in punctuation', () => {
    const name = 'moire';
    // Ids for the same pattern whose letters and digits match once punctuation goes.
    const look = (id: string) => (patternNameFor(id) === name ? id : undefined);
    for (let i = 0; i < 500; i++) {
      const a = look(`ja/a-${i}`);
      const b = look(`ja/a/${i}`);
      if (a && b) {
        expect(idsIn(drawInlinePattern(a))).not.toEqual(idsIn(drawInlinePattern(b)));
        return;
      }
    }
    throw new Error('no pair of such ids drew the pattern');
  });

  it('crops to its box only when asked', () => {
    expect(drawInlinePattern('ja/post-0')).not.toContain('preserveAspectRatio');
    expect(drawInlinePattern('ja/post-0', { crop: true })).toContain(
      'preserveAspectRatio="xMidYMid slice"',
    );
  });
});
