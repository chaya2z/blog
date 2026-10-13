// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { katexPlugin } from './src/features/posts/markdown/katex.ts';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // `math` parses conventional Markdown math (`$...$` / `$$...$$`) into AST nodes;
  // `katexPlugin` renders those nodes as HTML with KaTeX.
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexPlugin],
    }),
  },
  // Both fonts drop Astro's fallbacks: each variable would end in `sans-serif`,
  // which answers for every character, so no font after it is reached. The
  // stack, with its single generic at the end, is written in global.css.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['100 900'],
      styles: ['normal'],
      fallbacks: [],
    },
    {
      // Google, not Fontsource: Astro's Fontsource provider cannot select the
      // Japanese unicode-range slices, and its `japanese` file does not exist.
      // From Google, a page downloads just the slices for the characters it uses.
      // The Japanese slices are unnamed, so `subsets` keeps them all.
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      weights: ['100 900'],
      styles: ['normal'],
      fallbacks: [],
    },
  ],
});
