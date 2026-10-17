import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@blog/features/og-image/image';
import { ACCENT, INK, fill, stroke, svg } from '../../utils/svg';

/**
 * The blog's versions, from the History of the About page
 * (src/content/pages/about.md), copied here by hand: `built` marks the ones
 * built from code rather than on a blogging service.
 */
const REBUILDS = [
  { name: 'Blogger', date: '2019-02-26', built: false },
  { name: 'Hexo', date: '2019-12-09', built: true },
  { name: 'Gatsby', date: '2020-08-31', built: true },
  { name: 'Next.js', date: '2022-04-22', built: true },
  { name: 'Hatena Blog', date: '2023-04-07', built: false },
  { name: 'Astro', date: '2026-10-14', built: true },
];

const FIRST_YEAR = 2019;
const LAST_YEAR = 2027;
const YEAR_WIDTH = 130;
const LEFT = 80;

/** A date as a year with a fraction: 2019-02-26 is 2019 + 56/365. */
function yearOf(date: string): number {
  const day = new Date(`${date}T00:00:00Z`);
  const year = day.getUTCFullYear();
  const start = Date.UTC(year, 0, 1);
  const length = Date.UTC(year + 1, 0, 1) - start;
  return year + (day.getTime() - start) / length;
}

const x = (year: number) => LEFT + (year - FIRST_YEAR) * YEAR_WIDTH;

/**
 * The About card's picture: the blog's rebuilds as a staircase descending
 * along a timeline. Versions built from code are solid, the ones on a service
 * outlined, and the current one in the accent. The last runs off the card.
 */
export function drawRebuilds(): string {
  let out = '';
  // The site's 12-column grid.
  for (let i = 0; i <= 12; i++) {
    const gx = LEFT + (i * 1040) / 12;
    out += `<line x1="${gx}" y1="0" x2="${gx}" y2="${OG_IMAGE_HEIGHT}" ${stroke(INK)} stroke-opacity=".08"/>`;
  }
  for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
    out += `<rect x="${x(year) - 1}" y="56" width="2" height="16" ${fill(INK)}/>`;
    if (year < LAST_YEAR) {
      out += `<text x="${x(year) + 8}" y="70" ${fill(INK)} font-weight="800" font-size="16" letter-spacing="2">${year}</text>`;
    }
  }
  out += `<rect x="${LEFT}" y="80" width="${OG_IMAGE_WIDTH - LEFT}" height="4" ${fill(INK)}/>`;

  REBUILDS.forEach(({ name, date, built }, i) => {
    const last = i === REBUILDS.length - 1;
    const start = x(yearOf(date));
    const end = last ? x(LAST_YEAR + 1) : x(yearOf(REBUILDS[i + 1].date));
    const y = 120 + i * 80;
    out += built
      ? `<rect x="${start}" y="${y}" width="${end - start}" height="44" ${fill(last ? ACCENT : INK)}/>`
      : `<rect x="${start + 2}" y="${y + 2}" width="${end - start - 4}" height="40" ${stroke(INK)} stroke-width="4"/>`;
    // The last label would run off the card, so it ends left of its bar.
    const label = last ? `x="${start - 12}" text-anchor="end"` : `x="${start}"`;
    out += `<text ${label} y="${y - 10}" ${fill(INK)} font-weight="900" font-size="20" letter-spacing="1.5">${name.toUpperCase()} <tspan font-weight="500">${date.slice(0, 7).replace('-', '.')}</tspan></text>`;
  });

  out += `<text x="${LEFT}" y="590" ${fill(INK)} font-weight="800" font-size="20" letter-spacing="3">ABOUT · SIX VERSIONS SINCE 2019</text>`;
  return svg(OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, out);
}
