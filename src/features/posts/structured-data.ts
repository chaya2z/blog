import { AUTHOR } from '@/site';

/**
 * A post's schema.org `BlogPosting`, with the properties Google reads for an
 * article. Dates are UTC instants in ISO 8601.
 * ref: https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function postJsonLd(post: {
  title: string;
  imageUrl: string;
  publishedAt: Date;
  updatedAt?: Date | undefined;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.publishedAt.toISOString(),
    // Left out until the post is updated, rather than repeating the date above.
    ...(post.updatedAt && { dateModified: post.updatedAt.toISOString() }),
    author: [{ '@type': 'Person', name: AUTHOR.name, url: AUTHOR.links.website }],
  };
}
