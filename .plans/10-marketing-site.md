# Plan 10 — `init.now` marketing site

**Status:** Pending (DNS cutover)
**Size:** M
**Depends on:** 13 (soft)
**Affects:** 12 (there is no separate template-internal website context)

Build and deploy the public `init.now` site from the existing `apps/web` workspace. The
same implementation ships in scaffolded projects as a polished, replaceable example of
the template's Astro marketing app.

The visual reference is the original `get-convex/v1` marketing site:

- source: https://github.com/get-convex/v1/tree/main/apps/web
- homepage:
  https://github.com/get-convex/v1/blob/main/apps/web/src/app/page.tsx
- supporting UI:
  https://github.com/get-convex/v1/tree/main/apps/web/src/components

Use its visual composition as inspiration: a full-viewport hero, perspective grid,
animated headline, copyable scaffold command, compact header actions, and a technology
marquee. Do not port its Next.js implementation, branded assets, backend providers,
newsletter, analytics, or large inline logo modules.

## Decision

`apps/web` is the one marketing-site module:

- In this repository, Vercel deploys it to `init.now`.
- In scaffolded projects, it is the working marketing-site example users customize or
  remove through the normal workspace selection.
- It continues to participate in the root Bun workspace, Turbo graph, Adamantite
  checks, and shared package conventions.

Do not create a top-level `www/`, second lockfile, isolated dependency graph, special
cleanup path, or duplicate deployment implementation. The independent deployment
lifecycle is a Vercel project concern, not a reason to duplicate the source module.

This intentionally dogfoods the template. A change that breaks the scaffolded marketing
app should also fail the public site's build.

## 1. Replace the placeholder landing page

Rework the homepage and shared layout in `apps/web` into the Init landing page:

- Logo/wordmark
- Headline: **"Start once. Ship everywhere."**
- Description: **"Modern monorepo template for shipping TypeScript apps everywhere."**
- Copyable scaffold command:

  ```sh
  bun create metaideas/init my-app
  ```

- GitHub link
- Compact "Featuring" marquee for the core stack: Bun, Turborepo, Astro, TanStack
  Start, Hono, Expo, Drizzle, Better Auth, Tailwind, and other choices that are actually
  present in the template
- Minimal footer with GitHub and license

The homepage should adopt the reference's character without becoming a clone:

- dark, restrained visual system
- perspective grid above and below the hero
- strong display typography paired with quiet monospace details
- subtle headline reveal and continuously moving technology strip
- responsive composition that remains useful on narrow mobile screens

Honor `prefers-reduced-motion`; reduced-motion visitors get the final headline and a
static technology strip. The copy button must be keyboard accessible, expose a useful
label, and announce its copied state.

## 2. Keep the implementation native to the existing app

- Keep Astro and static output.
- Reuse `@init/ui` styling and existing workspace packages where they reduce duplicate
  implementation. Do not add a second design system for the landing page.
- Prefer Astro, CSS, and a small inline script for the copy interaction. Use a React
  island only if it produces a materially clearer implementation; do not reproduce the
  reference's client-heavy dependency graph.
- Store technology metadata in one small data structure and render the desktop/static
  and mobile/marquee treatments from it.
- Keep assets small and locally owned. Do not paste the reference footer's large,
  repeated inline SVG payload.
- Add no dependency on `apps/app`, `apps/api`, `packages/backend`, or an external
  service.
- Preserve useful starter capabilities already established in `apps/web`—localization,
  blog content infrastructure, RSS, sitemap, and 404 handling—unless a concrete conflict
  requires a separate decision. They do not need promotional sections on the v1
  homepage.

## 3. Metadata and public-site behavior

- Set the canonical site URL to `https://init.now` in production.
- Add the Init favicon, title, description, canonical metadata, Open Graph image, and
  social preview metadata.
- Keep the root URL useful and canonical. Locale routing must not leave
  `https://init.now` as a meta-refresh or placeholder page.
- The production landing page must require no environment variables beyond deployment
  metadata and no external account at build or runtime.
- Do not add email capture, authentication, a dashboard preview, documentation content,
  analytics, or backend-powered features in v1.

## 4. Deploy `apps/web` to Vercel

- Create a Vercel project for `init.now` using this monorepo and the `apps/web`
  workspace.
- Configure installation/code generation so shared workspace imports resolve before the
  Astro build.
- Set `PUBLIC_SITE_URL=https://init.now` for production.
- Deploy `main` to production and retain Vercel preview deployments for pull requests.
- Use the Vercel build check as the primary deployment signal. If it does not cover
  pull requests reliably, add one path-aware build workflow for `apps/web` and the
  shared packages/tooling it consumes; do not add a `www.yml` workflow.

## 5. Template behavior and documentation

- Keep `apps/web` in the ordinary app-selection flow. Selecting it during
  `bun template setup` retains the polished example; omitting it removes the workspace.
- Do not add `apps/web` to `init.cleanupPaths`.
- Update the root README to identify the deployed example and link to `init.now`.
- Update `apps/web/README.md` with the local development/build commands and a short list
  of the branding/content users normally replace.
- Make the scaffold command, tagline, GitHub URL, and metadata consistent across the
  landing page and root README.
- Record that the site demonstrates the template but does not distribute recipes or
  provide an updater. Plan 07's recipes remain local and snapshot-matched under
  `turbo/generators/`.

## Verification

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
bun run build --filter=web
```

Manual:

- Verify the page at narrow mobile, tablet, and desktop widths.
- Verify keyboard focus, copy feedback, contrast, and reduced-motion behavior.
- Verify title, canonical URL, favicon, Open Graph image, and social metadata in the
  built output.
- Run `bun template setup` in a disposable scaffold:
  - keeping `web` retains the complete landing page and its workspace dependencies
  - omitting `web` removes it cleanly

## Acceptance criteria

- `init.now` serves the `apps/web` implementation from this repository.
- The page clearly follows the `get-convex/v1` visual direction without porting its
  Next.js-specific or service-dependent implementation.
- The scaffold command is correct, copyable, accessible, and visually central.
- The page is responsive, honors reduced motion, and includes complete basic metadata.
- `apps/web` builds through the monorepo with zero required external services.
- Scaffolded projects receive the same polished site when they keep the `web`
  workspace.
- There is no `www/`, independent site lockfile, duplicate site implementation, or
  marketing-site cleanup rule.
- The site contains no hosted recipe catalog or machine-readable code-distribution
  routes.

## Out of scope

- A second template-internal marketing app.
- Email capture or newsletter infrastructure.
- Authentication, example-dashboard sign-in, or backend integration.
- Analytics.
- A documentation portal or authored blog campaign.
- Hosted template recipes, a remote installer, or automated project updates.

## Decisions

- Source module: `apps/web`
- Hosting: Vercel at `init.now`
- Visual reference: `get-convex/v1/apps/web`
- Tagline: "Start once. Ship everywhere." / "Modern monorepo template for shipping
  TypeScript apps everywhere."
- Scaffold command: `bun create metaideas/init my-app`
- Scaffold behavior: the branded site ships as replaceable demo content when `web` is
  selected
- Optional code distribution: local Turbo recipes from Plan 07
