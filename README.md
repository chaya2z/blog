# blog

A personal tech blog built with [Astro](https://astro.build) and served from
[Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/).

## Quick start

Requires Node.js 24.4+ and pnpm.

```sh
pnpm install
pnpm dev
```

## Open Graph images

The Open Graph images are rendered ahead of time and committed under `public/og/`.
After changing a card's design, render them again:

```sh
pnpm exec playwright install chromium  # once
pnpm og
```

The cards are a separate Astro site in `og/`, so their pages and fonts never reach the
blog's build. `pnpm og` builds that site and shoots each page with Chromium. Every card is
shot before any image is replaced, so a failed run leaves the committed images as they were.
While designing, `pnpm og:dev` shows the site's card at `/site/`.

The cards import the blog's text and styles through `@blog/*`. The blog imports nothing
from `og/`; it only links the images.

## Why Astro

Astro is built for content sites, so running a blog on it is simple:

- **Content Collections** validate post frontmatter with a schema, so a missing or
  mistyped field fails the build.
- **Markdown and MDX** are supported out of the box. Images can sit next to the post that
  uses them.
- **Static output with no client JavaScript by default.** Article pages ship plain HTML
  and CSS. Interactive parts load JavaScript only where they need it.

## Why Cloudflare Workers

- **Commercial use is allowed on the free plan.** The blog may show ads later.
  [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
  prohibits commercial use, and
  [Vercel Hobby](https://vercel.com/docs/limits/fair-use-guidelines) counts ads as
  commercial use. The Cloudflare [terms](https://www.cloudflare.com/terms/) do not limit
  the Free plan to non-commercial use.
- **Workers can run server-side code.** API routes such as view counts can be added to the
  same deployment later, under `/api/*`.
- **Free while traffic is low.** Requests for static assets are
  [free and unlimited](https://developers.cloudflare.com/workers/platform/pricing/). Only
  requests that run a Worker script count against the Free plan's daily limit. Pages are
  served as static assets, with no Worker script in front of them.
- **Cheaper than AWS.** S3 and CloudFront also allow commercial use and server-side code.
  But the
  [CloudFront Free plan](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html)
  covers only 1M requests and 100 GB of transfer a month, and the next plan is paid.
  Cloudflare serves static assets for free at any traffic level.
- **The domain is already on Cloudflare.** DNS and hosting stay in one place.

Pricing and terms were checked in October 2026. Cloudflare recommends
[Workers over Pages](https://developers.cloudflare.com/pages/) for new projects, so this
site uses Workers Static Assets.

## Directory structure

The code uses a hybrid feature-based structure. It keeps the directories and conventions
that Astro reserves, such as `src/pages/` and `src/content/`, and organizes everything else
by feature. Below is the target layout.

```text
.
├── public/                # Static files served as-is
├── src/
│   ├── pages/             # Routes: URLs, getStaticPaths(), page assembly
│   ├── content.config.ts  # Content Collection schemas
│   ├── content/
│   │   ├── posts/
│   │   │   └── <lang>/<slug>/
│   │   │       ├── index.md   # Post body
│   │   │       └── image.png  # Images used by the post
│   │   └── pages/
│   │       └── <id>.md        # Standalone page, such as privacy.md
│   ├── features/          # Code that belongs to one feature
│   │   ├── posts/
│   │   └── home/
│   ├── components/        # Components that no single feature owns
│   ├── layouts/           # Page layouts
│   ├── assets/
│   │   └── icons/         # Icons, with their sources and terms
│   ├── plugins/           # Build plugins, such as Markdown processing
│   ├── styles/            # Global CSS, design tokens and shared stylesheets
│   └── utils/             # Helpers that no single feature owns, one file per subject
├── og/                    # The Open Graph cards, a separate Astro site
└── astro.config.mjs
```

- Code used by only one feature lives in `features/<name>/`. Only code that spans
  features goes in the top-level `components/`, `layouts/`, `assets/`, `plugins/`,
  `styles/` and `utils/`.
- `pages/` handles routing and page assembly. Queries, URL builders and other feature
  logic belong in `features/`.
- Each file in `utils/` covers one subject and is named after it, for example `date.ts`.
  There are no grab-bag files such as `helpers.ts`, and no `index.ts` that re-exports
  the rest.
- Unit tests sit next to the code they test, for example `queries.test.ts`.
- The styling approach (CSS Modules, global CSS, or a mix) is not decided yet.

## URL structure

| Page       | Path                    |
| :--------- | :---------------------- |
| Home       | `/`                     |
| Post index | `/posts/`               |
| Post       | `/<lang>/posts/<slug>/` |
| About      | `/about/`               |

`<lang>` is a [BCP 47](https://www.rfc-editor.org/info/bcp47) language tag: `en` or `ja`.
The post index lists posts in both languages.

## Design

The visual direction is **Type Poster**. Large typography is the main graphic element.

- **Grid:** a Swiss-style 12-column grid, with New Wave accents. Display type is offset by
  whole columns and uses extreme letter-spacing and mixed weights. Body text stays on a
  straight, readable column.
- **Color:** red, black and off-white for now. The palette is not final.
- **Shape:** square corners and strong rules. On small screens the layout reflows to one
  column.
- **Accessibility:** WCAG 2.2 AA contrast, visible keyboard focus, and support for
  `prefers-reduced-motion`. No real text is rotated or set vertically.
