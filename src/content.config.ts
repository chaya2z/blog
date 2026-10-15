import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each post lives at `posts/<lang>/<slug>/index.md`, so the entry id is `<lang>/<slug>`.
// Do not add a `slug` field: the glob loader would use it as the id and drop the lang.
const posts = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
  }),
});

// Standalone pages such as the privacy policy, each at `pages/<id>.md`.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { posts, pages };
