# Plan 10 — init.now marketing site

Create the marketing page for init at **init.now** (domain already owned). It is deliberately barebones at v1 — modeled on the original `v1.run` (midday-ai/v1 template starter, see archived capture: https://web.archive.org/web/20260120054710/https://v1.run/). It also becomes the **host for the registry** (plan 07): human-browsable at `init.now/registry`, machine-readable JSON at `init.now/r/<item>.json`. Plan 07 now depends on this plan.

## Reference: what v1.run was (entire page)

- Logo + wordmark
- One-line description ("An open-source starter kit based on Midday.")
- A single copyable scaffold command (`bunx degit midday-ai/v1 v1`)
- GitHub link, "Get updates" email capture, HN badge
- A "Featuring" logo marquee (technologies in the stack)

Nothing else. Match that scope discipline.

## 1. Where it lives

**In this repo, top-level `www/`** — following the `cli/` precedent: outside the root Bun workspaces, own lockfile, template-internal (never shipped to scaffolded projects).

Rationale:

- The registry build (plan 07's `registry/` → static JSON) deploys with the site in one pipeline; separate repos would split that.
- `cli/` already establishes the "internal standalone dir" pattern, including cleanup in `init-now setup` and exclusion lists.
- Not a workspace: the page must not depend on `@init/*` packages (it outlives template refactors, and a barebones page doesn't need them). If sharing ever matters, revisit.

Do NOT confuse with `apps/web` — that is the _template's_ marketing-site starter for scaffolded projects. `www/` is marketing for init itself.

## 2. v1 scope (barebones, single page)

Stack: Astro (static output) — already used twice in this repo, zero-JS by default, trivially hosts static registry JSON later. Tailwind for styling. No React unless something actually needs interactivity.

Content (copy decided by maintainer):

- Logo/wordmark + headline **"Start once, ship everything"**, subheader **"Modern monorepo template for shipping TypeScript apps everywhere."** (same tagline as the README/GitHub — keep them in sync)
- The scaffold command, copyable: `bunx init-now@latest my-app` with a copy button (the one place a splash of JS is warranted). Switches to `bun create init-now my-app` once plan 11 ships.
- GitHub repo link
- A compact "What's included" strip: the stack (Bun, Turborepo, Hono, TanStack Start, Expo, Drizzle, better-auth, Tailwind, ...) as text or small logos — the v1.run "Featuring" marquee equivalent
- OG image + basic meta tags, favicon
- Footer: license, GitHub

Explicitly out of scope for v1 (decided): email capture ("Get updates"), docs content (the `apps/docs` starter is separate), blog, analytics, auth, any backend.

## 3. Registry hosting seams (build now, fill in plan 07)

- Reserve routes: `/registry` (human-browsable index page — placeholder or hidden until plan 07 ships) and `/r/*` (static JSON output directory).
- The site build copies plan 07's built registry artifacts into the output (`www` build step consumes `registry/` build output when it exists; no-op until then).
- Keep URLs stable from day one: `init.now/r/<item>.json` is the contract `init-now` and `shadcn add` will use.

## 4. Deployment

- **Vercel** (decided). Wire the `init.now` domain; connect the repo with the project root set to `www/`, so Vercel builds/deploys on `main` pushes and gives preview deployments on PRs touching `www/`.
- `.github/workflows/www.yml`: path-filtered to `www/**` (and later `registry/**`) — build-only check on PRs (Vercel handles deploys). Mirror the setup-bun/cache steps from the CLI workflow (plan 09). If Vercel's own PR checks make this redundant, skip the workflow — don't duplicate CI.

## 5. Template-internal cleanup

`www/` and its workflow must never reach scaffolded projects:

- Add `www/` and `.github/workflows/www.yml` to `cleanupInternalFiles` in `cli/src/commands/setup.ts` (and to the manifest `internalPaths` once plan 04 lands, so plan 06's `update` never re-adds them).
- Add both to the cleanup-list test introduced by plan 09 §5.
- Exclude `www/**` from root adamantite/knip scopes the same way `cli/**` is handled (own tooling inside `www/` if desired; a static Astro page may just need `bun run check` via its own tsconfig — keep it light).

## Acceptance criteria

- `init.now` serves the one-page site; Lighthouse-basics pass (meta, OG image, mobile layout); the scaffold command is copyable and correct.
- `cd www && bun install && bun run build` produces a static output; CI workflow builds it on PRs touching `www/**` only.
- `/r/` and `/registry` routes exist as stable seams (even if placeholder).
- A scaffolded project contains no `www/` and no `www.yml` (covered by the cleanup-list test).

## Decisions (settled with maintainer)

- Tagline: "Start once, ship everything" / "Modern monorepo template for shipping TypeScript apps everywhere." (from README/GitHub)
- Hosting: Vercel
- Email capture: skipped for v1
- Scaffold command: `bunx init-now@latest my-app` now; `bun create init-now` after plan 11
