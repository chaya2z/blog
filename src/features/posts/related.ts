import { parsePostId } from './id';

/** What relating posts needs from each: a post entry has all of it. */
export interface RelatablePost {
  id: string;
  data: { tags: string[]; publishedAt: Date };
}

/**
 * The posts most like `post`, at most `limit`: those sharing the most tags
 * first, then those in its language, then the newest. A post sharing no tag is
 * not related, so a post with an uncommon topic may get none.
 */
export function relatedPosts<P extends RelatablePost>(
  post: P,
  posts: readonly P[],
  limit = 3,
): P[] {
  const tags = new Set(post.data.tags);
  const { lang } = parsePostId(post.id);
  return posts
    .filter((other) => other.id !== post.id)
    .map((other) => ({
      other,
      shared: other.data.tags.filter((tag) => tags.has(tag)).length,
      sameLang: parsePostId(other.id).lang === lang,
    }))
    .filter(({ shared }) => shared > 0)
    .toSorted(
      (a, b) =>
        b.shared - a.shared ||
        Number(b.sameLang) - Number(a.sameLang) ||
        b.other.data.publishedAt.valueOf() - a.other.data.publishedAt.valueOf(),
    )
    .slice(0, limit)
    .map(({ other }) => other);
}
