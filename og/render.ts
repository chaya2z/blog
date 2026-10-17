import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtempDisposable, readdir, rename, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, preview } from 'astro';
import { chromium, type Page } from 'playwright';
import {
  OG_IMAGE_URL_DIR,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  ogImagePath,
} from '../src/features/og-image/image.ts';

/*
 * Renders the Open Graph images into the blog's public/og/, where they are
 * committed: builds the card site, serves the build with Astro's preview
 * server, and shoots each page with Chromium, so the cards are shot as built.
 *
 * Every card is shot before any image is replaced. A run that fails leaves the
 * committed images as they were.
 */

declare global {
  interface Window {
    /** Set by each card page; settles once the card is laid out for its screenshot. */
    cardReady?: Promise<void>;
  }
}

// Paths, not URLs: `preview()` fails on a URL root.
const root = fileURLToPath(new URL('./', import.meta.url));
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

await build({ root, logLevel: 'warn' });

// Each card is a page at `<card>/index.html`, shot to its image's path.
const cards = (await readdir(join(root, 'dist'), { recursive: true }))
  .filter((file) => file.endsWith(`${sep}index.html`))
  .map((file) => dirname(file).split(sep).join('/'));
// The blog links its images whatever is built here, so no cards means a card
// page went missing, not that the images should go.
if (cards.length === 0) {
  throw new Error(`No card pages were built in ${join(root, 'dist')}`);
}

// Removed however the run ends, after the server and browser below close.
await using shots = await mkdtempDisposable(join(tmpdir(), 'og-images-'));
// The shots are laid out as public/ is.
const images = join(shots.path, OG_IMAGE_URL_DIR);
{
  // Port 0 takes any free port, so a running dev server is never in the way.
  const server = await preview({ root, logLevel: 'warn', server: { port: 0 } });
  // Only stopped: `closed()` never settles for a static site.
  await using _ = { [Symbol.asyncDispose]: () => server.stop() };
  await using browser = await chromium.launch({ channel: 'chromium' });
  const page = await browser.newPage({
    viewport: { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT },
  });
  for (const card of cards) {
    await shoot(
      page,
      `http://localhost:${server.port}/${card}/`,
      join(shots.path, ogImagePath(card)),
    );
  }
}
await replaceDirectory(images, join(publicDir, OG_IMAGE_URL_DIR));

process.stdout.write(
  `Rendered ${cards.length} Open Graph image${cards.length === 1 ? '' : 's'} into public${OG_IMAGE_URL_DIR}\n`,
);

async function shoot(page: Page, url: string, png: string): Promise<void> {
  await page.goto(url);
  // `load` does not wait for fonts that the CSS requests late, and a card
  // adjusts its layout once they arrive. A card that never sets `cardReady`
  // fails the run instead of being shot half laid out.
  await page.waitForFunction(() => window.cardReady !== undefined, null, { timeout: 10_000 });
  await page.evaluate(() => window.cardReady);
  await mkdir(dirname(png), { recursive: true });
  await page.screenshot({ path: png });
}

/**
 * Replaces `target` whole with a copy of `source`, so the image of a removed
 * card goes too. If the copy fails, `target` is put back as it was.
 *
 * The old `target` is moved aside, not deleted, into a directory in og/: on
 * the same filesystem as public/, so the move is a rename that cannot half
 * happen, and outside public/, so nothing left behind is deployed.
 */
async function replaceDirectory(source: string, target: string): Promise<void> {
  await using backup = await mkdtempDisposable(join(root, '.backup-'));
  const old = join(backup.path, 'old');
  const hadTarget = existsSync(target);
  if (hadTarget) await rename(target, old);
  try {
    // Made first, as a copy of a temporary directory would keep its owner-only mode.
    await mkdir(target);
    await cp(source, target, { recursive: true });
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    if (hadTarget) await rename(old, target);
    throw error;
  }
}
