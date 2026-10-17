import { OG_IMAGE_HEIGHT } from '@blog/features/og-image/image';
import { fnv1a, randomInt, splitmix32 } from '../../utils/random';
import { ACCENT, DEEP, INK, MIST, PAPER, SHALLOW, fill, stroke, svg } from '../../utils/svg';

const WIDTH = 500;
const H = OG_IMAGE_HEIGHT;

// The ocean's depth zones, from the surface down, each one shade deeper.
const ZONES = [
  { name: 'EPIPELAGIC', depth: '0 m', color: MIST },
  { name: 'MESOPELAGIC', depth: '200 m', color: SHALLOW },
  { name: 'BATHYPELAGIC', depth: '1,000 m', color: ACCENT },
  { name: 'ABYSSOPELAGIC', depth: '4,000 m', color: DEEP },
  { name: 'HADAL', depth: '6,000 m', color: INK },
];

/**
 * The Posts card's picture: a section through the ocean, read from the top
 * down as the list runs from the newest post back to the oldest. A sounding
 * line drops from the surface to a seeded depth, with a depth scale at the edge.
 */
export function drawStrata(seed: string): string {
  const random = splitmix32(fnv1a(seed));
  const band = H / ZONES.length;
  let out = '';
  ZONES.forEach(({ name, depth, color }, i) => {
    const y = i * band;
    // Light type on the three deepest zones.
    const type = i < 2 ? INK : PAPER;
    out +=
      `<rect x="0" y="${y}" width="${WIDTH}" height="${band}" ${fill(color)}/>` +
      `<text x="24" y="${y + 34}" ${fill(type)} font-weight="800" font-size="17" letter-spacing="2.4">${name}</text>` +
      `<text x="24" y="${y + 58}" ${fill(type)} font-weight="500" font-size="17" letter-spacing="1">${depth}</text>`;
  });

  // The line shows in paper where it runs through the dark zones, and the lead at its end too.
  const lineX = 300 + randomInt(random, 3) * 50;
  const end = (2 + randomInt(random, 3)) * band + 30 + random() * (band - 60);
  out +=
    `<line x1="${lineX}" y1="0" x2="${lineX}" y2="${end}" ${stroke(PAPER)} stroke-width="4"/>` +
    `<line x1="${lineX}" y1="0" x2="${lineX}" y2="${Math.min(end, 2 * band)}" ${stroke(INK)} stroke-width="4"/>` +
    `<rect x="${lineX - 16}" y="${end}" width="32" height="32" ${fill(PAPER)}/>`;
  for (let tick = 0; tick < H; tick += 21) {
    out += `<line x1="${WIDTH - 18}" y1="${tick}" x2="${WIDTH}" y2="${tick}" ${stroke(tick < 2 * band ? INK : PAPER)} stroke-width="${tick % 126 === 0 ? 3 : 1}"/>`;
  }
  return svg(WIDTH, H, out);
}
