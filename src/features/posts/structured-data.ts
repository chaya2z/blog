import { AUTHOR } from '@/site';

/**
 * A post's schema.org `BlogPosting`, with the properties Google reads for an
 * article, as JSON safe to embed in a script element. Dates are UTC instants
 * in ISO 8601.
 * ref: https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function postJsonLd(post: {
  title: string;
  imageUrl: string;
  publishedAt: Date;
  updatedAt?: Date | undefined;
}): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.publishedAt.toISOString(),
    // Left out until the post is updated, rather than repeating the date above.
    ...(post.updatedAt && { dateModified: post.updatedAt.toISOString() }),
    author: [{ '@type': 'Person', name: AUTHOR.name, url: AUTHOR.links.website }],
  };
  // `<` escaped, so no data value can end the script element the JSON sits in.
  return JSON.stringify(data).replaceAll('<', '\\u003c');
}
