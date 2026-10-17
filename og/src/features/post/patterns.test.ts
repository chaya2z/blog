import { describe, expect, it } from 'vitest';

import { PATTERN_NAMES, drawPattern, patternNameFor } from './patterns';

const IDS = Array.from({ length: 200 }, (_, i) => `ja/post-${i}`);

describe('drawPattern', () => {
  it('draws the same picture on every call', () => {
    expect(drawPattern('web', 'ja/vlan-notes')).toBe(drawPattern('web', 'ja/vlan-notes'));
  });

  it('draws a different picture for another post', () => {
    expect(drawPattern('web', 'ja/vlan-notes')).not.toBe(drawPattern('web', 'ja/homelab-2021'));
  });

  it.each(PATTERN_NAMES)('returns %s as an SVG as tall as the card', (name) => {
    expect(drawPattern(name, 'ja/vlan-notes')).toMatch(
      /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="630"/,
    );
  });
});

describe('patternNameFor', () => {
  it('gives a post the same pattern on every call', () => {
    expect(patternNameFor('ja/vlan-notes')).toBe(patternNameFor('ja/vlan-notes'));
  });

  it('gives every post one of the patterns', () => {
    for (const id of IDS) expect(PATTERN_NAMES).toContain(patternNameFor(id));
  });

  it('moves only the posts of a pattern that is dropped', () => {
    const [dropped, ...rest] = PATTERN_NAMES;
    for (const id of IDS) {
      const before = patternNameFor(id);
      if (before !== dropped) expect(patternNameFor(id, rest)).toBe(before);
    }
  });

  it('uses every pattern across many posts', () => {
    expect(new Set(IDS.map((id) => patternNameFor(id)))).toEqual(new Set(PATTERN_NAMES));
  });
});
