import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The loaders' bases are URLs from this file, not paths from the project root,
// so the Open Graph card site in og/, a project of its own, loads the same files.

// `z.iso.datetime()` takes only `Z` as the offset and requires the time.
const utcDateTime = z.iso.datetime().transform((value) => new Date(value));

// Each post lives at `posts/<lang>/<slug>/index.md`, so the entry id is `<lang>/<slug>`.
// Do not add a `slug` field: the glob loader would use it as the id and drop the lang.
const posts = defineCollection({
  loader: glob({ pattern: '**/index.md', base: new URL('./content/posts/', import.meta.url) }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    // Instants in UTC, such as `'2026-09-08T19:00:00Z'`, quoted: YAML would
    // read a bare one as a date and the string check would reject it.
    publishedAt: utcDateTime,
    // The last update worth telling readers of, not every typo fix; absent when
    // there has been none.
    updatedAt: utcDateTime.optional(),
    // Topics, in the post's own spelling (product names keep their case).
    tags: z.array(z.string().min(1)).default([]),
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
