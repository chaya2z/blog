import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { parsePostId } from './id';
import type { Lang } from './languages';

export type PostEntry = CollectionEntry<'posts'>;

/** Returns posts, newest first. */
export async function getPosts({ lang }: { lang?: Lang } = {}): Promise<PostEntry[]> {
  const posts = await getCollection(
    'posts',
    (post) => lang === undefined || parsePostId(post.id).lang === lang,
  );
  return posts.toSorted((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export async function getPost(lang: Lang, slug: string): Promise<PostEntry | undefined> {
  return getEntry('posts', `${lang}/${slug}`);
}
