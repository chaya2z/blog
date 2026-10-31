import { AUTHOR } from '@/site';
import { formatInstant } from '@/utils/date';

/**
 * A post's schema.org `BlogPosting`, with the properties Google reads for an
 * article. Dates are UTC instants in ISO 8601, to the second.
 * ref: https://developers.google.com/search/docs/appearance/structured-data/article
 */
export function postJsonLd(post: {
  title: string;
  description: string;
  /** A BCP 47 tag, as in the page's `lang`. */
  lang: string;
  tags: string[];
  imageUrl: string;
  publishedAt: Date;
  updatedAt?: Date | undefined;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    inLanguage: post.lang,
    keywords: post.tags,
    image: [post.imageUrl],
    datePublished: formatInstant(post.publishedAt),
    // Left out until the post is updated, rather than repeating the date above.
    ...(post.updatedAt && { dateModified: formatInstant(post.updatedAt) }),
    author: [{ '@type': 'Person', name: AUTHOR.name, url: AUTHOR.links.website }],
  };
}

/**
 * A post's schema.org `BreadcrumbList`: the trail Breadcrumbs.astro shows,
 * Home › Posts › the post. The post itself needs no URL; Google takes the
 * page's own.
 * ref: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
 */
export function postBreadcrumbJsonLd(post: { title: string; siteUrl: URL }) {
  const trail = [
    { name: 'Home', item: new URL('/', post.siteUrl).href },
    { name: 'Posts', item: new URL('/posts/', post.siteUrl).href },
    { name: post.title },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({ '@type': 'ListItem', position: i + 1, ...crumb })),
  };
}
