import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import { getPosts } from '@/features/posts/content';
import { toFeedHtml } from '@/features/posts/feed';
import { getPostPath } from '@/features/posts/routing';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/site';

// Readers keep what they have fetched, so the feed only needs recent posts.
// Full content makes each item large, and readers poll the whole file.
const FEED_LIMIT = 20;

// One feed for every language: the blog is English first.
export const GET: APIRoute = async ({ site, url }) => {
  const posts = (await getPosts()).slice(0, FEED_LIMIT);
  // `post.rendered.html` leaves images as placeholders that only `render()`
  // resolves, so each post is rendered as its page renders it.
  const container = await AstroContainer.create();
  const items = await Promise.all(
    posts.map(async (post) => {
      const link = getPostPath(post.id);
      const { Content } = await render(post);
      const html = await container.renderToString(Content);
      return {
        title: post.data.title,
        description: post.data.description,
        link,
        pubDate: post.data.publishedAt,
        content: toFeedHtml(html, new URL(link, site)),
      };
    }),
  );
  // The RSS Advisory Board recommends `atom:link rel="self"`: it names the
  // feed's own URL, so a reader can tell where to fetch it from.
  const selfUrl = new URL(url.pathname, site).href;
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<atom:link href="${selfUrl}" rel="self" type="application/rss+xml"/>`,
    items,
  });
};
