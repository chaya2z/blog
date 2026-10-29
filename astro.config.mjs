// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { katexPlugin } from './src/plugins/katex.ts';
import { sidenotesPlugin } from './src/plugins/sidenotes.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.chaya2z.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
  // `math` parses conventional Markdown math (`$...$` / `$$...$$`) into AST nodes;
  // `katexPlugin` renders those nodes as HTML with KaTeX. `sidenotesPlugin`
  // copies each footnote beside its reference, for the post page's margin.
  markdown: {
    processor: satteri({
      features: { math: true },
      mdastPlugins: [katexPlugin],
      hastPlugins: [sidenotesPlugin],
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
      // One subset of the characters the site uses, made by `pnpm fonts`.
      // Google's unicode-range slices made a Japanese page fetch dozens of
      // files and inlined over 120 @font-face rules into every page.
      provider: fontProviders.local(),
      name: 'Noto Sans JP',
      cssVariable: '--font-noto-sans-jp',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/noto-sans-jp-subset.woff2'],
            weight: '100 900',
            style: 'normal',
          },
        ],
      },
      fallbacks: [],
    },
  ],
});
