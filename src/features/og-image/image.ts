/*
 * What the blog and the card site agree on about the Open Graph images. The
 * card site in og/ renders each card into public/ at its path; the blog links
 * the images from there.
 */

// The size Open Graph consumers crop least: 1.91:1, as Facebook and X expect.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** The directory the images are served from, holding nothing else. */
export const OG_IMAGE_DIR = '/og/';

/** The path the image of a card is served at: `/og/site.png` for `site`. */
export function ogImagePath(card: string): string {
  return `${OG_IMAGE_DIR}${card}.png`;
}
