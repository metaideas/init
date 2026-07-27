# Plan 03 — App hygiene

Fix half-wired integrations, placeholders, and gaps across `apps/`. Guiding principle: **no external services required** — everything here must work with local dev alone (docker compose, mock modes). Sentry/PostHog/Resend remain opt-in; we add the local seams they'd plug into.

## 1. Error boundaries (no external services needed)

- `apps/app/src/router.tsx`: add a `defaultErrorComponent` (styled with `@init/ui`, offers "try again" via router invalidate). Currently only `defaultNotFoundComponent` is set — uncaught route errors white-screen.
- `apps/desktop/src/router` setup: same treatment.
- `apps/mobile`: export `ErrorBoundary` from the root layout (`src/app/_layout.tsx`) per expo-router convention, with a minimal fallback screen using `#shared/components/ui`.

These are plain React fallbacks. Log through `@init/observability` logger (already local-safe); do not wire Sentry.

## 2. Fix the forgot-password lie

`apps/app/src/features/auth/server/functions.ts:25-37` mocks `forgotPassword` with a `setTimeout`, and the UI (`apps/app/src/features/auth/components/forgot-password-form.tsx`) shows a success toast for an email never sent — while `@init/email` sits unused.

Fix (agreed direction):

1. Wire better-auth's `sendResetPassword` in `apps/api/src/shared/auth.ts` using `@init/email` (`sendEmail`). `@init/email` already has a `MOCK_RESEND` mode that logs/previews instead of sending — local dev needs no Resend key.
2. Replace the mocked server function so the flow goes through better-auth's actual reset endpoint.
3. Local verification is `MOCK_RESEND` logging/preview — decided: no mailpit/SMTP catcher (`@init/email` is Resend HTTP API; an SMTP path just for dev isn't worth it).
4. Remove the stray copied comment "// Add your global server functions here" from the feature's functions file.

## 3. Dead/broken env modules

- `apps/web/src/shared/env.ts`: never imported and contains a literal `TEST_VAR` placeholder. Either wire it into `astro.config.ts` via `@tooling/env`'s `ensureEnv` (like other apps) with real vars, or delete the file until web has env needs. Prefer wiring it — env validation is a claimed template feature.
- `apps/extension/src/shared/env.ts`: never imported, validates `VITE_API_URL` while sibling apps use `PUBLIC_API_URL`, and `runtimeEnv: process.env` cannot see Vite client env at runtime. Fix all three: consistent `PUBLIC_` prefix (WXT supports `import.meta.env`), correct runtimeEnv source, and import it from `wxt.config.ts`/entrypoints.

## 4. Placeholder & dead-weight cleanup

- `apps/api/src/functions/example.ts`: entirely commented-out, exports `null`. Delete (violates repo comment policy). `apps/api/src/routes/workflows.ts` already defines its own demo function.
- `apps/api`: collapse the three overlapping demos (`/v1/hello`, `hello` tRPC procedure, `/ping`) to one exemplar of each transport (one REST route with OpenAPI schema, one tRPC procedure). Keep `/health`.
- `apps/app/src/routes/api/test.ts`: delete.
- `<TanStackDevtools>` rendered unconditionally in `apps/app/src/routes/__root.tsx` and `apps/desktop/src/routes/__root.tsx`: gate on `import.meta.env.DEV`.
- `apps/extension`: remove the three unused `@webext-core/*` deps (`proxy-service`, `job-scheduler`, `isolated-element`) from package.json; delete the empty `src/entrypoints/content.ts` (matches `*://*.google.com/*` and does nothing) or give it a one-line real example.
- `apps/desktop/src/shared/assets/react.svg`, `apps/extension/src/shared/assets/react.svg`: delete leftover starter assets.
- `apps/mobile`: delete unused `src/shared/components/ui/alert.tsx`, `ui/toggle.tsx`, `external-link.tsx`, and stock Expo images (`react-logo*.png`, `partial-react-logo.png`).
- `apps/mobile/android/sentry.properties` (and iOS equivalent): remove hardcoded `defaults.org=metaideas` / `init-mobile` values (genericize/placeholder them). Decided: `ios/`/`android/` **stay committed** — do not gitignore them; just fix the leaked template-author values.
- `apps/docs`: minimum viable de-starterization — fix the social link in `astro.config.ts` (points at `https://github.com/withastro/starlight`), remove the dead Paraglide codegen (`@inlang/paraglide-js` dep + `codegen` script + `src/shared/internationalization/` output — Starlight uses its own i18n), remove the unused React integration (`@astrojs/react`), replace stock example content with 1-2 short pages about the scaffolded project. Keep the app.
- `apps/web`: replace the meta-refresh redirect in `src/pages/index.astro` with a proper redirect (Astro `redirects` config or middleware); add root `404.astro`; add `@astrojs/sitemap` + RSS for the blog (standard marketing-site table stakes, no external services).
- Paraglide i18n: compiled output is generated into all 7 apps but consumed only by `app` and `web`. Remove the codegen wiring from `desktop`, `extension`, `mobile`, `docs` (keep the `@tooling/internationalization` package; apps can re-add codegen when they need i18n).
- `apps/api` context wiring: the global tRPC/route context hard-sets `session: null` while `requireSession` resolves per-request — confusing double wiring. Make session resolution live in one place (the middleware) and remove the misleading context default/comment.
- `apps/mobile`: **delete the unreachable better-auth client** (`src/shared/auth.ts` — full client with admin/org plugins, imported by nothing) and drop `@init/auth` from mobile's deps. Decided: mobile ships without an auth client by default; it returns as two registry items (plan 07): `mobile-auth-client-api` (points at `apps/api`'s better-auth handler) and `mobile-auth-client-convex` (uses `@convex-dev/better-auth`'s client plugin + Convex site URL). Keep `@init/auth`'s expo subpaths — they serve the registry items and package selection.

## 4b. Desktop: local-first direction (decided)

`apps/desktop` stays and gets **smart, local-first investment** — desktop apps often do local filesystem work with no API at all, so outbound connections are unnecessary by default:

- Replace the `greet` demo (`src-tauri` command + `features/demo`) with a small, genuinely useful **local filesystem example**: e.g., a feature that picks a directory/file via the Tauri dialog plugin, reads/writes it through a Rust command or the fs plugin, and shows the Tauri `invoke` + TanStack Query `mutationOptions` pattern on something real.
- Remove the API-oriented wiring that exists "by default": `PUBLIC_API_URL` in `src/shared/env.ts` and the unused URL builder in `shared/utils.ts`. Connecting desktop to the API/auth becomes an opt-in registry item later (plan 07), not template default.
- Keep: the Tauri/Vite config (`TAURI_*` handling), theme toggle, router shell, error boundary (§1).
- No auth, no tRPC client, no i18n by default.

## 5. Turbo/CI wiring

- `apps/api/turbo.json`: delete phantom `build:types` and `deploy` tasks (no corresponding package.json scripts).
- Add `turbo.json` with `build` `outputs` for `apps/web` and `apps/docs` (Astro `dist/`) so builds cache.
- Root `turbo.json` build env: move API-only vars (`INNGEST_*`, `REDIS_URL`) out of the global build env into `apps/api`'s task config.
- `apps/app/src/shared/env.ts` + `apps/app/turbo.json`: the frontend extends `db()` preset and lists `DATABASE_URL`/`RESEND_API_KEY` in build env, but app talks to the DB only via the API. Remove server-side presets/vars that belong to `api`.
- `.github/workflows`: add a `turbo build` job (build all apps) so PRs catch build breakage — currently only lint/format/test run, and there are ~2 test files.
- `infra/local/docker-compose.yml`: add `healthcheck` blocks to redis/postgres/minio/inngest, and bootstrap the MinIO buckets declaratively (an `mc`-based init container creating the buckets from `packages/db`'s `StorageBucket` constants) — today the bucket only exists because it was created by hand in the gitignored `.data` dir. This bootstrap also serves plan 07's files-sdk contract suite, which runs live against local MinIO.

## 6. Seed real tests

Make `tests.yml` meaningful with a few high-value tests (bun:test, `__tests__` folders per repo convention):

- `apps/api`: middleware test (auth-required route rejects anonymous, health returns ok) using Hono's test client. The empty `apps/api/src/shared/__tests__/` dir is waiting for this.
- `apps/app`: one server-function or serialization test (`src/shared/server/serialization.ts` is pure logic).
- Keep scope small — the goal is patterns for template users to copy, not coverage.

## Acceptance criteria

- `bun run check`, `bun run analyze`, `bun test`, `turbo build` all pass locally.
- No route in `app` can white-screen without a styled fallback.
- Forgot-password flow completes against local stack with no external keys (email visible via MOCK_RESEND logging/preview).
- `rg "TEST_VAR|@webext-core" --glob '!node_modules'` returns nothing.
- CI includes a build job.
