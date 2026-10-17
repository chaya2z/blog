import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The loaders' bases are URLs from this file, not paths from the project root,
// so the Open Graph card site in og/, a project of its own, loads the same files.

// Each post lives at `posts/<lang>/<slug>/index.md`, so the entry id is `<lang>/<slug>`.
// Do not add a `slug` field: the glob loader would use it as the id and drop the lang.
const posts = defineCollection({
  loader: glob({ pattern: '**/index.md', base: new URL('./content/posts/', import.meta.url) }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
  }),
});

// Standalone pages such as the privacy policy, each at `pages/<id>.md`.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: new URL('./content/pages/', import.meta.url) }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(1),
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { posts, pages };
