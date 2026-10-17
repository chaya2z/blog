import { readdirSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, ogImagePath, postOgImagePath } from './image';

// The images are rendered by `pnpm og` and committed. Paths are relative to
// the project root, where tests run.

// Each post's id, `<lang>/<slug>`, from its file at `<lang>/<slug>/index.md`.
const POST_IDS = readdirSync('src/content/posts', { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith(`${sep}index.md`))
  .map((file) => dirname(file).split(sep).join('/'));

// Also catches a size changed in image.ts without rendering again, which
// would have the meta tags announce a size the image does not have.
async function sizeOf(path: string) {
  const { width, height } = await sharp(join('public', path)).metadata();
  return { width, height };
}

const SIZE = { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };

describe('Open Graph images', () => {
  it('has the image of the site at the announced size; run `pnpm og` if not', async () => {
    expect(await sizeOf(ogImagePath('site'))).toEqual(SIZE);
  });

  it('finds the posts', () => {
    expect(POST_IDS.length).toBeGreaterThan(0);
  });

  // The card site serves each card where the blog links its image, so a card
  // page moved in og/ shows up here as missing images.
  it.each(POST_IDS)(
    'has the image of %s at the announced size; run `pnpm og` if not',
    async (id) => {
      expect(await sizeOf(postOgImagePath(id))).toEqual(SIZE);
    },
  );
});
