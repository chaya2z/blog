import { isLang, type Lang } from './languages';

export type PostIdParts = {
  lang: Lang;
  slug: string;
};

/**
 * Splits an entry id such as `en/hello-world` into its language and slug.
 * The slug may contain slashes, as in `en/series/part-1`.
 */
export function parsePostId(id: string): PostIdParts {
  const [lang, ...segments] = id.split('/');
  const slug = segments.join('/');
  if (!lang || !slug || !isLang(lang)) {
    throw new Error(`Invalid post id "${id}". Expected "<lang>/<slug>".`);
  }
  return { lang, slug };
}
