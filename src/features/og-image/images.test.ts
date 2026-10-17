import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, ogImagePath } from './image';

// The images are rendered by `pnpm og` and committed. Paths are relative to
// the project root, where tests run.
describe('Open Graph images', () => {
  // Also catches a size changed in image.ts without rendering again, which
  // would have the meta tags announce a size the image does not have.
  it('has the image of the site at the announced size; run `pnpm og` if not', async () => {
    const { width, height } = await sharp(join('public', ogImagePath('site'))).metadata();
    expect({ width, height }).toEqual({ width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT });
  });
});
