import { fnv1a } from '@/utils/random';
import { drawPattern, patternNameFor } from './patterns';

/**
 * A post's picture as SVG markup, ready to inline into a page that may show
 * other posts' pictures too: the ids inside it (a pattern's clip paths) take a
 * prefix hashed from the post's id, so one post's picture does not point at
 * another's. The same post drawn twice repeats its ids, but they then name the
 * same shapes. The Open Graph cards draw one picture each and use
 * `drawPattern` as it is.
 *
 * `crop` fills whatever box the picture is given, cutting its edges, instead
 * of fitting the whole picture inside.
 */
export function drawInlinePattern(postId: string, { crop = false } = {}): string {
  const prefix = `art-${fnv1a(postId).toString(36)}-`;
  let svg = drawPattern(patternNameFor(postId), postId);
  for (const [, id] of svg.matchAll(/\bid="([^"]+)"/g)) {
    svg = svg
      .replaceAll(`id="${id}"`, `id="${prefix}${id}"`)
      .replaceAll(`url(#${id})`, `url(#${prefix}${id})`);
  }
  return crop ? svg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ') : svg;
}
