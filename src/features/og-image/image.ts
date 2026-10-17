/*
 * What the blog and the card site agree on about the Open Graph images. The
 * card site in og/ renders each card into public/ at its path; the blog links
 * the images from there.
 */

// The size Open Graph consumers crop least: 1.91:1, as Facebook and X expect.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * The URL path the images are served under, holding nothing else. They sit at
 * the same path under public/.
 */
export const OG_IMAGE_URL_DIR = '/og/';

/** The path the image of a card is served at: `/og/site.png` for `site`. */
export function ogImagePath(card: string): string {
  return `${OG_IMAGE_URL_DIR}${card}.png`;
}

/**
 * The path of a post's image: `/og/posts/ja/vlan-notes.png` for `ja/vlan-notes`.
 * The card site serves each post's card at `posts/<id>/` to match.
 */
export function postOgImagePath(postId: string): string {
  return ogImagePath(`posts/${postId}`);
}
