import { parsePostId } from './id';

export function getPostPath(postId: string): string {
  const { lang, slug } = parsePostId(postId);
  // Keep the trailing slash to match `trailingSlash: 'always'` and
  // `build.format: 'directory'` (emits `<slug>/index.html`) in astro.config.mjs.
  // Without it, links would hit a 404 or a redirect instead of the canonical URL.
  return `/${lang}/posts/${slug}/`;
}
