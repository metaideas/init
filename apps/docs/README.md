<div align="center">
  <h1 align="center"><code>docs</code></h1>
</div>

The public init documentation site, built with
[Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).
It is also the complete documentation-site example inherited by scaffolded projects
that keep the docs application workspace.

## Commands

From the repository root:

```sh
bun run dev --filter=docs
bun run build --filter=docs
```

From `apps/docs`:

```sh
bun run dev
bun run build
```

The production build is static and uses Pagefind locally. It needs no hosted search,
external account, or runtime service.

## Content ownership

Root `docs/` owns authored Markdown and MDX. `apps/docs` owns only presentation:
content loading, routes, navigation, search, metadata, localization, styles, and
assets. Editing a root document and rebuilding publishes the change; there is no sync
command or duplicate content tree.

The loader in `src/content.config.ts` publishes top-level guides, `docs/architecture/`,
and `docs/es/`. It excludes `docs/agents/`, `docs/template/`, and `docs/adr/` by
default so maintainer guidance, upstream governance, research, and application-owner
decisions do not enter public routes or search.

## Customize the site

- Wordmark and marketing return link: `src/shared/components/site-title.astro`
- Colors and component styling: `src/shared/styles/globals.css`
- Site URL: `PUBLIC_SITE_URL` in `.env.schema`, with safe development values in
  `.env.development` and the production fallback in `src/shared/constants.ts`
- Marketing return URL: `PUBLIC_MARKETING_URL`; development otherwise falls back to
  the Web workspace at `http://localhost:3006` and production uses `init.now`
- Navigation, locales, edit links, and head metadata: `astro.config.ts`
- Favicon and social preview: `public/`

Add an English page under an included root `docs/` path with `title` and `description`
frontmatter, then add it to the manual sidebar when it belongs in the reader journey.
Add Spanish content at the matching path under `docs/es/`. Missing translations use
Starlight's normal English fallback notice.
