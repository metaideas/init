# Plan 07 — Registry (init.now)

Build a hosted code registry so the template ships a lean core while optional, copy-once code remains one command away. Prereqs: plans 02/03 (which populate the backlog below), 04 (CLI manifest/selection infrastructure), and 10 (the init.now marketing site, which hosts the registry: human-browsable index at `init.now/registry`, machine-readable JSON at `init.now/r/<item>.json` — the site reserves both routes as stable seams).

## Model (decided)

- **Packages stay packages**: units with their own third-party deps and lifecycle (payments, ai, analytics, kv, email, ...) remain selectable workspaces via `init-now setup` / `init-now add`.
- **Registry items are copy-once leaves**: code the user owns after install — utilities, templates, components, integration snippets. No versioned dependency on the template afterward.
- Registry items MAY target files inside existing `@init/*` packages (e.g., an analytics variant that drops files into `packages/analytics/src/` and appends an env preset).
- **Format: the shadcn registry schema** (`registry.json` + per-item JSON). It is general-purpose (arbitrary files, target paths, npm deps, env vars, docs) and means `shadcn add <url>` works even before `init-now` grows registry support. `init-now` provides the selection UX and delegates installation.

## 1. Registry content structure

Create `registry/` in this repo (source of truth), built/deployed to `init.now/r/`:

- `registry/registry.json` — index conforming to the shadcn registry schema.
- `registry/<item>/` — item sources + item manifest (name, description, type, files with targets, npm `dependencies`, `registryDependencies`, env vars).
- A build step that emits static JSON consumed by the `www/` site build (plan 10) and served at `https://init.now/r/<item>.json`. Add `registry` to knip/adamantite scopes so items stay lint-clean.
- Fill in the `/registry` page on the site (plan 10 ships it as a placeholder): a simple browsable index rendered from `registry.json` with per-item install commands.

Item targets must use template-relative paths (e.g. `packages/utils/src/codec.ts`), and contents use `@init/*` imports — the installer rewrites scope for renamed projects (§4).

## 2. Registry backlog (initial items)

Populated by deletions from plans 02/03 — agents executing those plans append here:

- `codec` — SuperJSON codec util (was `packages/utils/src/codec.ts`)
- `assert` — assertion helpers + `AssertError`/`UtilityError` types (was `packages/utils/src/assert.ts`, `packages/error/src/utils.ts`)
- `db-counter-helpers` — Drizzle `increment`/`decrement` (was `packages/db/src/helpers.ts`)
- `auth-tanstack-start-cookies` — (was `packages/auth/src/integrations/start.ts`)
- `stripe-agent-toolkit` — (was `packages/payments/src/helpers.ts` `createAgentToolkit`)
- `files-sdk` — complete storage integration recipe replacing `packages/storage/`: configured server instance, selected provider adapter, Hono backend route, browser/mobile client entry, authorization policy, validated env vars, conservative plugins, and asset-lifecycle hooks. It uses `files-sdk` directly and does not recreate an `@init/storage` package. See `docs/research/files-sdk.md` and §3 below.
- `email-organization-invitation` — email template (from `packages/email/src/templates/`), plus future email templates generally
- `mobile-auth-client-api` — the better-auth expo client removed from `apps/mobile` in plan 03 (`src/shared/auth.ts`), wired against `apps/api`'s better-auth handler, plus a minimal sign-in screen + session gate
- `mobile-auth-client-convex` — same client wired for the Convex backend: `@convex-dev/better-auth` client plugin + Convex site URL as `baseURL`
- `desktop-api-client` — opt-in wiring connecting `apps/desktop` to `apps/api` (env var, URL builder, fetch/tRPC client) — removed as a default in plan 03's local-first direction
- env presets removed in plan 02: `railway`, `openai`, `anthropic`, `s3`
- ~~`@init/ui` unused components~~ — **decided: NOT registry items.** All 57 components stay in the template: they are customized to fit the project (base-ui port, project theming), and the user model is "import what you need, delete the rest." Do not move them here.

## 3. `files-sdk` recipe requirements

Treat this as an application integration, not a thin S3-helper port:

1. Install an exact-pinned `files-sdk` version initially and only the chosen adapter's optional peer dependencies. Default to `files-sdk/bun-s3` for the lightweight Bun template; document `files-sdk/s3` as the richer S3 option for provider metadata, cache control, delimiter listing, server-side copy, durable multipart uploads, and stronger signed-upload policies. Do not use runtime provider loading unless a generated project genuinely selects providers at runtime.
2. Put the provider adapter, `Files` instance, bucket configuration, and plugin composition in `apps/api/src/shared/files.ts`. Mount the `files-sdk/hono` backend integration in `apps/api/src/routes/files.ts`. There is no shared storage workspace or wrapper API.
3. Keep server and client imports separate so provider credentials and native SDKs cannot enter frontend bundles. Frontends use `files-sdk/client` or the relevant framework integration directly; server code uses provider subpaths.
4. Make the backend deny-by-default. Integrate Init authentication, authorize operations plus bucket/key prefixes, validate file type and size before issuing upload authorization, and require a validated `FILES_API_SECRET`. Never rely on the SDK gateway's random per-process fallback, which is unsuitable across multiple instances.
5. Start with a conservative plugin policy: content-type handling, validation, and signed-URL policy. Make audit/tracing integrate with Init observability when installed. Keep compression, encryption, deduplication, versioning, usage accounting, soft deletion, failover, and tiering opt-in because they change semantics, persistence, or cost.
6. Keep `packages/db`'s `assets` table as the application source of truth for ownership, organization, lifecycle status, expiry, and application metadata. Provider object metadata is not authoritative. Signed direct uploads transfer bytes outside `Files.upload()`, so upload plugins alone cannot enforce or observe completion: the route must constrain authorization, verify the resulting object, and only then mark the asset available.
7. Add a provider contract suite covering upload/download/head/exists/delete/list, content-type behavior, missing objects, pagination, signed download/upload constraints, large-object streaming, cancellation/timeouts, and normalized errors. Run a live suite against the selected provider; upstream primarily mock-tests adapters and currently has live coverage only for S3 and filesystem.
8. Document capability differences instead of promising false portability. In particular, `bun-s3` lacks custom metadata, cache control, delimiter results, and server-side copy; its copy passes bytes through the process and resumable uploads buffer in-process. ACLs, signed URL expiry, upload limits, listing, metadata, and copy/move semantics vary across adapters. Use `files.capabilities` where available and keep provider-specific access behind the API composition root.
9. Do not mirror all upstream providers into a database enum. Store provider, bucket, and MIME type as text; a generated project can impose its own allowlist if needed.

The item may offer provider variants (for example `files-sdk-bun-s3`, `files-sdk-s3`, and `files-sdk-r2`) if the registry format cannot express a provider choice cleanly. Each variant must install only its own dependencies and env schema.

### Cross-plan coordination

- **The contract suite (item 7) runs against local MinIO — zero external services.** `infra/local/docker-compose.yml` already runs MinIO, and both `bun-s3` and `files-sdk/s3` accept custom endpoints. Point the live suite at the local MinIO endpoint; the bucket bootstrap added in plan 03 (§5, `mc` init container) provisions the buckets it needs. Cloud-provider live runs remain optional/manual, matching upstream's own policy.
- **The recipe requires `apps/api` — declare it in the item manifest.** Projects that chose the Convex backend (plan 04 backend choice) cannot install it; use the same `requires: ["api"]` concept plan 04 introduces for workspaces so the CLI filters/explains instead of failing at install. A `files-sdk-convex` variant (the adapter exists) is a separate future item — the mount point differs too much to parameterize.
- **Bucket constants have one owner: `packages/db`.** Plan 02 inlines `StorageBucket` into db; the recipe's `files.ts` composition and any prefix/bucket config must import those constants rather than define their own, so the `assets` table column types and the `Files` configuration cannot drift.
- **This item settles the versioning open question (for itself):** the item manifest records the exact `files-sdk` version it was validated against (e.g. a `validatedAgainst` field surfaced in the item description), and bumping that pin requires re-running the contract suite before publishing the updated item. Given upstream's release velocity (16 releases in 11 weeks, breaking major within 6 weeks of 1.0), do not float the version.
- **Env flows through the registry env mechanism (§4 step 3):** `FILES_API_SECRET` and the chosen adapter's provider vars ship as an env-preset addition applied on install, so `init-now add files-sdk-bun-s3` leaves env validation complete instead of printing a manual TODO.

## 4. CLI integration

Add `init-now add` support for registry items (extend plan 04's reworked `add`):

1. Fetch `https://init.now/r/registry.json`, present a multiselect (grouped by item type/category) — this is the selection UX the maintainer wants owned by `init-now`.
2. Install via one of (decide during implementation, prefer least code):
   - Shell out to `bunx shadcn add <item-url>` and post-process, or
   - A thin internal installer: download item JSON, write files to targets, `bun add` npm deps, honoring `registryDependencies`.
3. Post-install steps `init-now` owns regardless of installer:
   - Rewrite `@init/*` → project scope in installed files (reuse `replaceProjectNameInProjectFiles`, scoped to installed paths).
   - If an item declares env vars, print (or append) the additions needed in `.env.local` / env presets.
   - Verify target workspaces exist (an item targeting `packages/analytics` when the user never installed analytics → clear error naming the missing package and how to add it).
4. `init-now add` UX: `init-now add app|package` (workspaces, plan 04) and `init-now add item <name...>` / bare `init-now add` interactive picker spanning both.

## 5. Registry health

- CI job: validate every item's JSON against the shadcn schema, and typecheck item sources (a throwaway tsconfig including `registry/**` with template path aliases).
- A smoke test in `cli`: scaffold a temp project (or fixture), install one item (e.g. `codec`), assert file lands with rewritten scope and project typechecks.
- Install the default `files-sdk` recipe into an API scaffold, assert it adds no `@init/storage` workspace or import, and verify server-only provider modules are absent from the client build.

## Acceptance criteria

- `registry.json` + at least the backlog items above are published and installable via `bunx shadcn add <url>` into a scaffolded project.
- `init-now add` lists registry items and installs them with scope rewriting; works non-interactively (`init-now add item codec --yes`).
- Installing `codec` into a renamed project yields imports under the project scope, and `bun run check` passes.
- Installing a `files-sdk` provider variant produces a typechecking authenticated Hono route and client integration with only that provider's dependencies and validated env variables.
- Template contains no copies of backlog item code (registry is the single home).

## Decisions (settled with maintainer)

- **`validatedAgainst` is the standard for every registry item that installs pinned third-party deps** (not just files-sdk): the item manifest records the exact validated dependency version; bumping it requires re-validating the item before publishing.
- `@init/ui` components stay in the template in full (see backlog note above).
- Whether `@init/ui`'s unused components move to the registry (bundle-size win vs. friction).
