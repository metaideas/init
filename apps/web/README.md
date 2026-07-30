<div align="center">
  <h1 align="center"><code>web</code></h1>
</div>

The Astro marketing site deployed to [init.now](https://init.now) and shipped as the
template's polished, replaceable web example.

## Development

From the repository root:

```sh
bun run dev --filter=web
bun run build --filter=web
```

The app uses static output and needs no external service. Set
`PUBLIC_SITE_URL=https://example.com` when building a branded deployment; production
Init builds use `https://init.now`.

## Make it yours

Replace the wordmark and favicon, headline and supporting copy, scaffold command,
GitHub URL, technology list, and social preview metadata. The primary content lives in
`src/shared/components/landing.astro`; shared site values live in `src/shared/site.ts`.

Localization, blog content collections, RSS, sitemap generation, and 404 pages remain
available even though the v1 homepage stays focused on the scaffold.
