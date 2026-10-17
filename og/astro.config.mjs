// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// The Open Graph cards, built as a site of their own so that nothing here
// reaches the blog's build. `render.ts` builds it and shoots each page into
// the blog's public/og/.
// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  // It would sit in the shot of the card that the dev server shows.
  devToolbar: {
    enabled: false,
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Schibsted Grotesk',
      cssVariable: '--font-schibsted-grotesk',
      weights: ['800 900'],
      styles: ['normal'],
      fallbacks: [],
    },
    // Japanese titles; Latin in them stays in Schibsted Grotesk, listed first.
    {
      provider: fontProviders.google(),
      name: 'Murecho',
      cssVariable: '--font-murecho',
      weights: [800],
      styles: ['normal'],
      fallbacks: [],
    },
  ],
});
