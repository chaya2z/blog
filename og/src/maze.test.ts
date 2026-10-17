import { describe, expect, it } from 'vitest';

import { drawMaze } from './maze';

describe('drawMaze', () => {
  it('draws the same maze on every call', () => {
    expect(drawMaze('site')).toBe(drawMaze('site'));
  });

  it('draws a different maze for a different seed', () => {
    expect(drawMaze('site')).not.toBe(drawMaze('other'));
  });

  it('returns a standalone SVG the size of the card', () => {
    expect(drawMaze('site')).toMatch(
      /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="1200" height="630"/,
    );
  });
});
