import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@blog/features/og-image/image';
import { fnv1a, splitmix32 } from '@blog/utils/random';
import { ACCENT, INK, stroke, svg } from '@blog/utils/svg';

const W = OG_IMAGE_WIDTH;
const H = OG_IMAGE_HEIGHT;
// One column of the site's 12-column grid, on a 1200px card with 80px margins.
const CELL = 1040 / 12;
// The cells line up with the grid, so one column starts 80px in.
const LEFT = 80 - CELL;
const COLUMNS = Math.ceil((W - LEFT) / CELL);
const ROWS = Math.ceil(H / CELL);

/**
 * A "10 PRINT" maze over the whole card: one diagonal per grid cell, leaning
 * left or right at random, so the lines run into passages. The seed fixes the
 * picture between builds.
 */
export function drawMaze(seed: string): string {
  const random = splitmix32(fnv1a(seed));
  let out = '';
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const x = LEFT + column * CELL;
      const y = row * CELL;
      const d =
        random() < 0.5
          ? `M${x} ${y}L${x + CELL} ${y + CELL}`
          : `M${x + CELL} ${y}L${x} ${y + CELL}`;
      out += `<path d="${d}" ${stroke(random() < 0.1 ? ACCENT : INK)} stroke-width="10" stroke-linecap="square"/>`;
    }
  }
  return svg(W, H, out);
}
