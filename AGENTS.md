## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Linting and formatting

- After making code changes, run `pnpm oxlint --fix`, then run `pnpm oxfmt`.
- Before finishing, run `pnpm oxlint --format=agent`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Shell and file editing

- Prefer apply_patch when modifying existing files.
- The shell may have zsh's noclobber option enabled.
- When intentionally overwriting a file with shell redirection, use `>|` instead of `>`.
- Do not disable noclobber globally.
- Do not overwrite files without checking their existing content when preservation matters.
