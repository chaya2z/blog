import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtempDisposable, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  codePoints,
  cssContentChars,
  formatList,
  htmlChars,
  parseList,
  unicodesArg,
} from './font-chars.ts';

/*
 * Keeps src/assets/fonts/noto-sans-jp-subset.woff2 holding every character the
 * built site draws, so a page loads one small Japanese font instead of the
 * dozens of slices Google Fonts would send. The subset and its character list
 * are committed; the full font is downloaded only to make a new subset.
 *
 *   pnpm fonts             build, then add any new characters to the subset
 *   pnpm fonts --reset     build, then subset exactly the characters in use
 *   pnpm fonts:check       after a build, fail on a character the subset lacks;
 *                          needs neither the full font nor the tools (CI runs it)
 *
 * Making a subset needs `skera` (cargo install skera --features cli) and
 * `woff2_compress` (google/woff2) on the PATH.
 */

// From google/fonts, the repository Google Fonts serves from: its CSS API
// sends only unicode-range slices or static per-weight files, never the whole
// variable font, and always the latest release. Pinned to a commit so a new
// subset never mixes in glyphs from a newer release. To update, point both at
// a newer google/fonts commit.
const SOURCE_URL =
  'https://raw.githubusercontent.com/google/fonts/66a36c8c94b1a5d992ee4e7f392fccfe4945767c/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf';
const SOURCE_SHA256 = 'c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f';

const root = fileURLToPath(new URL('../', import.meta.url));
const distDir = join(root, 'dist');
const fontsDir = join(root, 'src/assets/fonts');
const subsetPath = join(fontsDir, 'noto-sans-jp-subset.woff2');
const listPath = join(fontsDir, 'noto-sans-jp-subset.txt');
const cachePath = join(root, '.cache/fonts/NotoSansJP[wght].ttf');

// Printable ASCII is kept whatever the pages use, so the Japanese font never
// leaves a basic Latin character to the system font.
const ASCII = String.fromCharCode(...Array.from({ length: 0x5f }, (_, i) => 0x20 + i));

async function usedCodePoints(): Promise<number[]> {
  if (!existsSync(distDir)) throw new Error('No dist/: build the site first.');
  let chars = ASCII;
  for (const file of await readdir(distDir, { recursive: true })) {
    if (file.endsWith('.html')) chars += htmlChars(await readFile(join(distDir, file), 'utf8'));
    else if (file.endsWith('.css'))
      chars += cssContentChars(await readFile(join(distDir, file), 'utf8'));
  }
  return codePoints(chars);
}

const sha256 = (data: Buffer) => createHash('sha256').update(data).digest('hex');

async function sourceFont(): Promise<Buffer> {
  if (existsSync(cachePath)) {
    const cached = await readFile(cachePath);
    if (sha256(cached) === SOURCE_SHA256) return cached;
  }
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`${SOURCE_URL}: HTTP ${response.status}`);
  const font = Buffer.from(await response.arrayBuffer());
  if (sha256(font) !== SOURCE_SHA256) {
    throw new Error(`${SOURCE_URL}: SHA-256 is ${sha256(font)}, expected ${SOURCE_SHA256}`);
  }
  await mkdir(join(cachePath, '..'), { recursive: true });
  await writeFile(cachePath, font);
  return font;
}

async function subset(cps: number[]): Promise<Buffer> {
  await using dir = await mkdtempDisposable(join(tmpdir(), 'subset-fonts-'));
  const input = join(dir.path, 'source.ttf');
  const output = join(dir.path, 'subset.ttf');
  await writeFile(input, await sourceFont());
  // Name IDs 0-6 are skera's default; 14 keeps the license URL, as Google's
  // own subsets do, which the OFL asks each copy to carry.
  execFileSync('skera', [
    `--path=${input}`,
    `--unicodes=${unicodesArg(cps)}`,
    '--name-i-ds=0,1,2,3,4,5,6,14',
    `--output-file=${output}`,
  ]);
  execFileSync('woff2_compress', [output], { stdio: 'ignore' });
  return readFile(join(dir.path, 'subset.woff2'));
}

const check = process.argv.includes('--check');
const reset = process.argv.includes('--reset');

const used = await usedCodePoints();
const listed = existsSync(listPath) ? parseList(await readFile(listPath, 'utf8')) : [];
const listedSet = new Set(listed);
const missing = used.filter((cp) => !listedSet.has(cp));

if (check) {
  if (missing.length > 0) {
    console.error(
      `The Noto Sans JP subset lacks ${missing.length} character(s) the site uses: ${String.fromCodePoint(...missing)}\nRun \`pnpm fonts\` and commit the result.`,
    );
    process.exit(1);
  }
} else if (missing.length === 0 && !reset) {
  process.stdout.write('The Noto Sans JP subset already has every character in use.\n');
} else {
  const cps = reset ? used : codePoints(String.fromCodePoint(...listed, ...missing));
  const font = await subset(cps);
  await writeFile(subsetPath, font);
  await writeFile(listPath, formatList(cps));
  process.stdout.write(
    `Subset Noto Sans JP to ${cps.length} characters (${missing.length} new), ${(font.length / 1024).toFixed(1)} KiB.\n`,
  );
}
