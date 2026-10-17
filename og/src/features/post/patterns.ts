import { OG_IMAGE_HEIGHT } from '@blog/features/og-image/image';
import { fnv1a, randomInt, splitmix32 } from '../../utils/random';

// The blog's colors from tokens.css, and two tints of them that the card
// defines. They resolve in the page the SVG is inlined into, through style
// attributes: `var()` is not certain to work in a presentation attribute.
const INK = 'var(--ink)';
const PAPER = 'var(--paper)';
const ACCENT = 'var(--accent)';
const DEEP = 'var(--deep)';
const MIST = 'var(--mist)';
const H = OG_IMAGE_HEIGHT;
// One column of the site's 12-column grid, on a 1200px card with 80px margins.
const COLUMN = 1040 / 12;

type Point = [number, number];

const points = (list: Point[]): string =>
  list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const fill = (color: string): string => `style="fill: ${color}"`;
const stroke = (color: string): string => `fill="none" style="stroke: ${color}"`;

const randomFor = (id: string) => splitmix32(fnv1a(id));

// Concentric arcs in groups of six, like the bars of a 6/8 tarantella.
function rings(id: string): string {
  const random = randomFor(id);
  const cx = 360 + randomInt(random, 4) * 60;
  const cy = 520 - randomInt(random, 3) * 90;
  let out = '';
  for (let i = 0; i < 12; i++) {
    const radius = 46 + i * 38;
    const width = [6, 14, 6, 24, 6, 14][i % 6];
    const length = 2 * Math.PI * radius;
    const on = length * (0.35 + random() * 0.5);
    out += `<circle cx="${cx}" cy="${cy}" r="${radius}" ${stroke(i % 6 === 3 ? ACCENT : INK)} stroke-width="${width}" stroke-dasharray="${on.toFixed(1)} ${(length - on).toFixed(1)}" transform="rotate(${randomInt(random, 8) * 45} ${cx} ${cy})"/>`;
  }
  return out + `<circle cx="${cx}" cy="${cy}" r="22" ${fill(ACCENT)}/>`;
}

// A Lohse-style grid. Colors step along (x·a + y·b + c) mod 5, so they run in diagonals.
function lohse(id: string): string {
  const random = randomFor(id);
  const palette = [null, MIST, ACCENT, DEEP, INK];
  const a = 1 + randomInt(random, 3);
  const b = 1 + randomInt(random, 3);
  const c = randomInt(random, 5);
  const skip = randomInt(random, 3);
  let out = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 6; x++) {
      let k = (x * a + y * b + c) % 5;
      // Keep the columns next to the title light, so the art never crowds it.
      if (x <= skip - 1 && k > 1) k = 0;
      const color = palette[k];
      if (color) {
        out += `<rect x="${x * COLUMN + 12}" y="${y * COLUMN + 12}" width="${COLUMN - 24}" height="${COLUMN - 24}" ${fill(color)}/>`;
      }
    }
  }
  return out;
}

// Bathymetric contours around a seeded deep.
function contours(id: string): string {
  const random = randomFor(id);
  const cx = 240 + random() * 160;
  const cy = 200 + random() * 240;
  const phases = [0, 0, 0, 0].map(() => random() * Math.PI * 2);
  const amplitudes = [0.16, 0.09, 0.06, 0.03].map((v) => v * (0.6 + random() * 0.8));
  const drift = random() - 0.5;
  let out = '';
  for (let k = 10; k >= 1; k--) {
    const base = 38 * k;
    const line: Point[] = [];
    for (let s = 0; s <= 120; s++) {
      const t = (s / 120) * Math.PI * 2;
      let m = 1;
      amplitudes.forEach((amplitude, j) => {
        m += amplitude * Math.sin((j + 1) * t + phases[j] + k * drift * 0.25 * (j + 1));
      });
      line.push([cx + Math.cos(t) * base * m, cy + Math.sin(t) * base * m]);
    }
    const major = k % 5 === 0;
    const color = major ? ACCENT : INK;
    out += `<polygon points="${points(line)}" style="fill: ${k === 1 ? ACCENT : 'none'}; stroke: ${color}" stroke-width="${major ? 3 : 1.5}"/>`;
  }
  return out;
}

// An orb web strung from a point near the top edge.
function web(id: string): string {
  const random = randomFor(id);
  const ax = 520 - 60 - random() * 220;
  const ay = 10 + random() * 50;
  const n = 8 + randomInt(random, 5);
  const from = ((25 + random() * 20) * Math.PI) / 180;
  const to = ((200 + random() * 25) * Math.PI) / 180;
  const spokes: number[] = [];
  for (let i = 0; i < n; i++) {
    spokes.push(from + ((to - from) * (i + (random() - 0.5) * 0.4)) / (n - 1));
  }
  let out = `<rect x="${ax - 7}" y="0" width="14" height="${ay}" ${fill(INK)}/>`;
  for (const t of spokes) {
    out += `<line x1="${ax}" y1="${ay}" x2="${ax + Math.cos(t) * 900}" y2="${ay + Math.sin(t) * 900}" ${stroke(INK)} stroke-width="3"/>`;
  }
  const hot = 4 + randomInt(random, 6);
  for (let m = 1; m <= 12; m++) {
    const ring = spokes.map((t): Point => {
      const radius = 38 * m * (1 + (random() - 0.5) * 0.12);
      return [ax + Math.cos(t) * radius, ay + Math.sin(t) * radius];
    });
    out += `<polyline points="${points(ring)}" ${stroke(m === hot ? ACCENT : INK)} stroke-width="${m === hot ? 6 : 2}"/>`;
  }
  return out;
}

// A halftone screen: a seeded wave, fading from a seeded point.
function halftone(id: string): string {
  const random = randomFor(id);
  const width = 520;
  const pitch = 26;
  const angle = random() * Math.PI * 2;
  const wavelength = 50 + random() * 70;
  const phase = random() * Math.PI * 2;
  const fx = random() * width;
  const fy = random() * H;
  let out = '';
  for (let y = pitch / 2; y < H; y += pitch) {
    for (let x = pitch / 2; x < width; x += pitch) {
      const wave =
        0.5 + 0.5 * Math.sin((x * Math.cos(angle) + y * Math.sin(angle)) / wavelength + phase);
      const fall = Math.max(0, 1 - Math.hypot(x - fx, y - fy) / 560);
      const f = wave * (0.3 + 0.7 * fall);
      const radius = f * pitch * 0.5;
      if (radius < 1.2) continue;
      out += `<circle cx="${x}" cy="${y}" r="${radius.toFixed(1)}" ${fill(f > 0.72 ? ACCENT : INK)}/>`;
    }
  }
  return out;
}

// Two line screens a few degrees apart, clipped to a circle and a square.
function moire(id: string): string {
  const random = randomFor(id);
  const cx = 200 + random() * 140;
  const cy = 220 + random() * 200;
  const angle = randomInt(random, 180);
  const delta = 3 + random() * 5;
  const radius = 170 + random() * 50;
  const sx = cx - 70 + random() * 140;
  const sy = cy - 70 + random() * 140;
  const side = 290;
  const lines = (color: string): string => {
    let s = '';
    for (let k = -50; k <= 50; k++) {
      s += `<rect x="-600" y="${(cy + k * 14).toFixed(1)}" width="1800" height="6" ${fill(color)}/>`;
    }
    return s;
  };
  return (
    `<defs><clipPath id="moire-circle"><circle cx="${cx}" cy="${cy}" r="${radius}"/></clipPath>` +
    `<clipPath id="moire-square"><rect x="${sx - side / 2}" y="${sy - side / 2}" width="${side}" height="${side}"/></clipPath></defs>` +
    `<g clip-path="url(#moire-circle)"><g transform="rotate(${angle} ${cx} ${cy})">${lines(INK)}</g></g>` +
    `<g clip-path="url(#moire-square)"><g transform="rotate(${angle + delta} ${cx} ${cy})">${lines(ACCENT)}</g></g>`
  );
}

// Stacked sonar traces; each line hides the ones behind it.
function ridges(id: string): string {
  const random = randomFor(id);
  const width = 520;
  const rows = 14;
  const mx = 180 + random() * 200;
  const hot = randomInt(random, rows);
  let out = '';
  for (let i = 0; i < rows; i++) {
    const y0 = 150 + i * 34;
    const bumps = Array.from({ length: 2 + randomInt(random, 3) }, () => [
      mx + (random() - 0.5) * 220,
      18 + random() * 46,
      30 + random() * 110,
    ]);
    const line: Point[] = [];
    for (let x = 0; x <= width; x += 8) {
      let h = 0;
      for (const [c, w, a] of bumps) h += a * Math.exp(-((x - c) ** 2) / (2 * w * w));
      line.push([x, y0 - h * Math.max(0, 1 - Math.abs(x - mx) / 320)]);
    }
    out += `<polygon points="${points([...line, [width, H], [0, H]])}" ${fill(PAPER)}/>`;
    out += `<polyline points="${points(line)}" ${stroke(i === hot ? ACCENT : INK)} stroke-width="${i === hot ? 6 : 3}"/>`;
  }
  return out;
}

// Twelve frames of a turning square, read like a dance count.
function pirouette(id: string): string {
  const random = randomFor(id);
  const cols = 3;
  const cell = 520 / cols;
  const size = 104;
  const step = [7.5, 11.25, 15, 22.5][randomInt(random, 4)];
  const hot = randomInt(random, 12);
  const direction = random() < 0.5 ? 1 : -1;
  let out = '';
  for (let i = 0; i < 12; i++) {
    const cx = ((i % cols) + 0.5) * cell;
    const cy = 315 + (Math.floor(i / cols) - 1.5) * 150;
    const turn = `transform="rotate(${direction * i * step} ${cx} ${cy})"`;
    out +=
      i === hot
        ? `<rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" ${fill(ACCENT)} ${turn}/>`
        : `<rect x="${cx - size / 2 + 4}" y="${cy - size / 2 + 4}" width="${size - 8}" height="${size - 8}" ${stroke(INK)} stroke-width="6" ${turn}/>`;
    out += `<rect x="${cx - 4}" y="${cy - 4}" width="8" height="8" ${fill(INK)}/>`;
  }
  return out;
}

// The slug punched into 8-channel paper tape, as ASCII.
function tape(id: string): string {
  const random = randomFor(id);
  const slug = id.split('/').pop() ?? id;
  const sequence = [...new TextEncoder().encode(slug), 0, 0];
  const pitch = 26;
  const tapeWidth = 9 * pitch + 20;
  const start = randomInt(random, sequence.length);
  const lanes = [
    [40, start, randomInt(random, pitch)],
    [40 + tapeWidth + 26, start + 24 + randomInt(random, 6), randomInt(random, pitch)],
  ];
  let out = '';
  for (const [x, first, dy] of lanes) {
    out += `<rect x="${x}" y="0" width="${tapeWidth}" height="${H}" ${fill(MIST)}/>`;
    for (let row = -1; row < 25; row++) {
      const byte =
        sequence[(((first + row) % sequence.length) + sequence.length) % sequence.length];
      const hy = row * pitch + pitch / 2 + dy;
      for (let bit = 0; bit < 8; bit++) {
        // The sprocket track runs between channels 3 and 4.
        const channel = bit < 3 ? bit : bit + 1;
        if ((byte >> bit) & 1) {
          out += `<circle cx="${x + 10 + channel * pitch + pitch / 2}" cy="${hy}" r="9" ${fill(byte === 45 ? ACCENT : INK)}/>`;
        }
      }
      out += `<circle cx="${x + 10 + 3 * pitch + pitch / 2}" cy="${hy}" r="4" ${fill(INK)}/>`;
    }
  }
  return out;
}

interface Pattern {
  /** The SVG's width; the height is the card's. */
  width: number;
  /** Draws the pattern's shapes from a seed. */
  draw: (seed: string) => string;
}

const PATTERNS = {
  halftone: { width: 520, draw: halftone },
  moire: { width: 520, draw: moire },
  web: { width: 520, draw: web },
  rings: { width: 600, draw: rings },
  ridges: { width: 520, draw: ridges },
  contours: { width: 520, draw: contours },
  lohse: { width: 520, draw: lohse },
  pirouette: { width: 520, draw: pirouette },
  tape: { width: 520, draw: tape },
} satisfies Record<string, Pattern>;

export type PatternName = keyof typeof PATTERNS;

/** Every pattern's name. */
export const PATTERN_NAMES = Object.keys(PATTERNS) as PatternName[];

/**
 * The pattern of a post, by rendezvous hashing: each pattern scores the post,
 * and the highest score wins. The post's id alone decides it, so adding a post
 * never moves another's, and dropping a pattern moves only the posts that had
 * it. Each score is the first number of SplitMix32 seeded by FNV-1a, which
 * mixes the whole key; FNV-1a alone would score names that end alike alike.
 * ref: https://en.wikipedia.org/wiki/Rendezvous_hashing
 */
export function patternNameFor(
  postId: string,
  names: readonly PatternName[] = PATTERN_NAMES,
): PatternName {
  const score = (name: PatternName) => splitmix32(fnv1a(`${postId}\n${name}`))();
  return names.reduce((best, name) => (score(name) > score(best) ? name : best));
}

/**
 * Draws the named pattern from a seed, the post's id, so the picture never
 * changes between builds. It fills the card's height and sits at its right.
 */
export function drawPattern(name: PatternName, seed: string): string {
  const { width, draw } = PATTERNS[name];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}">${draw(seed)}</svg>`;
}
