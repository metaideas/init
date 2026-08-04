# Varlock validation

Research date: 2026-08-03

Plan: [Plan 17 — Validate Varlock across init](../../../.plans/17-varlock-validation.md)

Overall decision: **Pending**

Baseline status: **Complete**

## Scope and method

This first checkpoint records the environment behavior that Varlock must preserve or
deliberately replace. It does not install Varlock or change the current T3 Env path.
The evidence is the repository's source, configuration, package metadata, templates,
and controlled imports with isolated, synthetic environment values.

Versions at the baseline:

| Component          | Version | Source                                            |
| ------------------ | ------: | ------------------------------------------------- |
| Bun                |  1.3.14 | `bun --version` and root `packageManager`         |
| `@t3-oss/env-core` | 0.13.10 | `packages/env/package.json`                       |
| Zod                |   4.3.5 | `packages/utils/package.json`                     |
| `std-env`          |   4.2.0 | `packages/env/package.json`                       |
| Vite               |   8.1.5 | `tooling/env/package.json`                        |
| Turbo              |  2.10.7 | root `package.json`                               |
| Expo               | 54.0.33 | `apps/mobile/package.json`                        |
| Convex             |  1.42.3 | `packages/backend/package.json`                   |
| WXT                |  0.21.1 | `apps/extension/package.json`                     |
| Tauri CLI          |   2.9.6 | `apps/desktop/package.json`                       |
| Astro              |   7.1.4 | `apps/docs/package.json`, `apps/web/package.json` |

Inventory commands:

```sh
find packages/env tooling/env -type f -maxdepth 4 -print | sort
find apps packages infra tooling turbo -name '.env.template' -o -name '.env.example' -o -name '.env.schema' | sort
rg -n --hidden --glob '!node_modules/**' --glob '!bun.lock' --glob '!.git/**' \
  '\b(process\.env|import\.meta\.env|Bun\.env|Deno\.env)' \
  apps packages tooling turbo scripts infra
rg -n --hidden --glob '!node_modules/**' --glob '!bun.lock' --glob '!.git/**' \
  'from "@init/env|from "std-env"|\benv\.[A-Z][A-Z0-9_]*' \
  apps packages tooling turbo scripts infra
```

No `.env.schema` exists at this checkpoint. Environment contracts are TypeScript/Zod
objects created with T3 Env.

## Current architecture

`@init/env` exports T3 Env's `createEnv`, three public prefixes, and a runtime merge
helper. `packages/env/src/presets.ts` centrally owns reusable package contracts.
Applications extend those presets in an application-local `src/shared/env.ts`. Several
shared packages also call their corresponding preset directly when a client or command
needs configuration.

The current data flow is:

```text
environment files / framework-provided values
  -> Bun, Vite loadEnv, Expo, Tauri, WXT, Convex, or the host process
  -> std-env / process.env / import.meta.env
  -> @init/env preset and application createEnv calls
  -> parsed application or package env object
```

The Vite-family loader is custom. `ensureEnv(mode, cwd)` calls Vite `loadEnv` with an
empty prefix, copies every loaded value into `process.env`, and imports the
application's env module through Jiti (`tooling/env/src/vite.ts:7-11`). This makes env
validation a configuration-time side effect for:

- TanStack Start and Tauri inside their async Vite configuration functions
  (`apps/app/vite.config.ts:12-16`, `apps/desktop/vite.config.ts:10-14`);
- Astro at module evaluation before `defineConfig`
  (`apps/docs/astro.config.ts:12-17`, `apps/web/astro.config.ts:9-12`); and
- WXT through its Vite configuration callback
  (`apps/extension/wxt.config.ts:17-29`).

The Bun API has no equivalent explicit loader. Its entrypoint imports the env module,
so it relies on Bun or the launching process to have populated `process.env`
(`apps/api/src/index.ts:4-8`). Drizzle commands similarly call package presets from
their Bun-launched configuration and scripts (`packages/db/drizzle.config.ts:1-17`).
Expo imports the mobile env module as an entrypoint side effect
(`apps/mobile/src/index.ts:1-3`), while `app.config.ts` reads three Sentry values
directly before Metro starts (`apps/mobile/app.config.ts:48-53`). Convex functions use
a T3 Env module over `process.env` inside the Convex source tree
(`packages/backend/src/functions/shared/env.ts:1-12`).

## Contract inventory

Classification rules used below:

- **Sensitive** means a credential, signing value, secret, or URL likely to embed
  credentials. Sentry DSNs and public analytics project keys are classified as
  non-sensitive because the current code intentionally permits them in clients.
- **Client/build** means a value may be embedded into a browser, desktop webview, or
  native JavaScript artifact.
- **Server/runtime** means application or package server code consumes the value.
- **Tool/build** means configuration, code generation, deployment, or build tooling
  consumes the value.
- Requiredness describes the current Zod contract, not whether a template happens to
  provide a development value.

### Reusable contracts in `packages/env`

| Owner / preset       | Keys                                                                                                                | Boundary                                           | Requiredness and parsed output                                                                                                                              | Evidence                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Auth                 | `AUTH_SECRET`                                                                                                       | Sensitive, server/runtime                          | Required string                                                                                                                                             | `packages/env/src/presets.ts:12-41`   |
| Auth                 | `AUTH_TRUSTED_ORIGINS`                                                                                              | Non-sensitive, server/runtime                      | Required comma-separated string parsed to a trimmed, non-empty array; entries must be HTTP(S), wildcard HTTP(S), wildcard hosts, or custom-protocol origins | `packages/env/src/presets.ts:17-38`   |
| GitHub auth provider | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`                                                                          | Sensitive, server/runtime                          | Required strings                                                                                                                                            | `packages/env/src/presets.ts:43-52`   |
| Google auth provider | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                                                          | Sensitive, server/runtime                          | Required strings                                                                                                                                            | `packages/env/src/presets.ts:53-62`   |
| Convex Expo client   | `EXPO_PUBLIC_CONVEX_SITE_URL`, `EXPO_PUBLIC_CONVEX_URL`                                                             | Non-sensitive, client/build                        | Required URLs                                                                                                                                               | `packages/env/src/presets.ts:64-74`   |
| Convex web client    | `PUBLIC_CONVEX_SITE_URL`, `PUBLIC_CONVEX_URL`                                                                       | Non-sensitive, client/build                        | Required URLs                                                                                                                                               | `packages/env/src/presets.ts:75-85`   |
| Database             | `DATABASE_URL`                                                                                                      | Sensitive, server/runtime and tool/build           | Required URL                                                                                                                                                | `packages/env/src/presets.ts:87-95`   |
| Database             | `RUN_PRODUCTION_MIGRATIONS`                                                                                         | Non-sensitive, tool/build                          | Optional input; defaults to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:92`      |
| Inngest              | `INNGEST_BASE_URL`                                                                                                  | Non-sensitive, server/runtime                      | Optional URL                                                                                                                                                | `packages/env/src/presets.ts:97-108`  |
| Inngest              | `INNGEST_DEV`                                                                                                       | Non-sensitive, server/runtime                      | Optional input; defaults to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:102`     |
| Inngest              | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`                                                                          | Sensitive, server/runtime                          | Required strings                                                                                                                                            | `packages/env/src/presets.ts:103-104` |
| Inngest              | `INNGEST_SIGNING_KEY_FALLBACK`                                                                                      | Sensitive, server/runtime                          | Optional string                                                                                                                                             | `packages/env/src/presets.ts:105`     |
| KV                   | `REDIS_URL`                                                                                                         | Sensitive, server/runtime                          | Required URL                                                                                                                                                | `packages/env/src/presets.ts:110-117` |
| Portless             | `PORTLESS_URL`                                                                                                      | Non-sensitive, server/runtime and tool/development | Optional URL                                                                                                                                                | `packages/env/src/presets.ts:119-126` |
| Resend               | `EMAIL_FROM`                                                                                                        | Non-sensitive, server/runtime                      | Required string                                                                                                                                             | `packages/env/src/presets.ts:128-137` |
| Resend               | `MOCK_RESEND`                                                                                                       | Non-sensitive, server/runtime                      | Optional input; defaults to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:133`     |
| Resend               | `RESEND_API_KEY`                                                                                                    | Sensitive, server/runtime                          | Required string even when `MOCK_RESEND` is true                                                                                                             | `packages/env/src/presets.ts:134`     |
| S3                   | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`                                                                          | Sensitive, server/runtime                          | Required strings                                                                                                                                            | `packages/env/src/presets.ts:139-150` |
| S3                   | `S3_BUCKET`                                                                                                         | Non-sensitive, server/runtime                      | Required string                                                                                                                                             | `packages/env/src/presets.ts:144`     |
| S3                   | `S3_ENDPOINT`, `S3_REGION`                                                                                          | Non-sensitive, server/runtime                      | Optional strings; the endpoint is not URL-validated                                                                                                         | `packages/env/src/presets.ts:145-146` |
| Sentry web client    | `PUBLIC_SENTRY_DSN`                                                                                                 | Non-sensitive, client/build                        | Required string                                                                                                                                             | `packages/env/src/presets.ts:152-162` |
| Sentry web client    | `PUBLIC_SENTRY_DEBUG`                                                                                               | Non-sensitive, client/build                        | Optional input; defaults to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:156`     |
| Sentry Expo          | `EXPO_PUBLIC_SENTRY_DSN`                                                                                            | Non-sensitive, client/build                        | Required string                                                                                                                                             | `packages/env/src/presets.ts:163-176` |
| Sentry Expo          | `SENTRY_AUTH_TOKEN`                                                                                                 | Sensitive, tool/build                              | Required string                                                                                                                                             | `packages/env/src/presets.ts:171`     |
| Sentry Expo          | `SENTRY_ORG`, `SENTRY_PROJECT`                                                                                      | Non-sensitive, tool/build                          | Required strings                                                                                                                                            | `packages/env/src/presets.ts:173-174` |
| Sentry Expo          | `SENTRY_DEBUG`                                                                                                      | Non-sensitive, tool/build                          | Optional input; defaults to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:172`     |
| Sentry server        | `SENTRY_AUTH_TOKEN`                                                                                                 | Sensitive, tool/build                              | Required string                                                                                                                                             | `packages/env/src/presets.ts:177-189` |
| Sentry server        | `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`                                                                        | Non-sensitive, server/runtime or tool/build        | Required strings                                                                                                                                            | `packages/env/src/presets.ts:181-185` |
| Sentry server        | `SENTRY_DEBUG`, `SENTRY_SPOTLIGHT`                                                                                  | Non-sensitive, server/runtime                      | Optional inputs; default to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:182-186` |
| Stripe               | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`                                                                        | Sensitive, server/runtime                          | Required strings                                                                                                                                            | `packages/env/src/presets.ts:192-200` |
| PostHog Expo         | `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`                                                           | Non-sensitive, client/build                        | Required string and URL                                                                                                                                     | `packages/env/src/presets.ts:202-212` |
| PostHog web          | `PUBLIC_POSTHOG_API_KEY`, `PUBLIC_POSTHOG_HOST`                                                                     | Non-sensitive, client/build                        | Required string and URL                                                                                                                                     | `packages/env/src/presets.ts:213-222` |
| PostHog server       | `POSTHOG_API_KEY`                                                                                                   | Sensitive, server/runtime                          | Required string                                                                                                                                             | `packages/env/src/presets.ts:223-231` |
| PostHog server       | `POSTHOG_HOST`                                                                                                      | Non-sensitive, server/runtime                      | Required URL                                                                                                                                                | `packages/env/src/presets.ts:228`     |
| Tauri                | `TAURI_ENV_ARCH`, `TAURI_ENV_FAMILY`, `TAURI_ENV_PLATFORM`, `TAURI_ENV_PLATFORM_VERSION`, `TAURI_ENV_TARGET_TRIPLE` | Non-sensitive, tool/build and client/build         | Optional strings                                                                                                                                            | `packages/env/src/presets.ts:234-247` |
| Tauri                | `TAURI_ENV_DEBUG`                                                                                                   | Non-sensitive, tool/build and client/build         | Optional input; defaults to boolean `false`                                                                                                                 | `packages/env/src/presets.ts:238`     |

All reusable presets except the Expo Sentry preset use `skipValidation: isCI`. The
Expo Sentry preset omits it (`packages/env/src/presets.ts:163-176`). Because presets
are created before an application's outer `createEnv` call, an application's own
`skipValidation` does not suppress a failing preset validation.

### Application-owned contracts

| Owner          | Keys                                      | Boundary                                       | Requiredness and parsed output                                                                                                                   | Evidence                                            |
| -------------- | ----------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Hono API       | `ALLOWED_API_ORIGINS`                     | Non-sensitive, server/runtime                  | Required comma-separated string parsed to a trimmed string array; unlike trusted origins it does not validate URL shapes or remove empty entries | `apps/api/src/shared/env.ts:21-29`                  |
| Hono API       | `BASE_URL`                                | Non-sensitive, server/runtime                  | Required URL                                                                                                                                     | `apps/api/src/shared/env.ts:30`                     |
| Hono API       | `FILES_API_SECRET`                        | Sensitive, server/runtime                      | Required string with minimum length 32                                                                                                           | `apps/api/src/shared/env.ts:31`                     |
| Hono API       | `PORT`                                    | Non-sensitive, server/runtime                  | Coerced number; defaults to `3000`                                                                                                               | `apps/api/src/shared/env.ts:32`                     |
| TanStack app   | `PUBLIC_API_URL`                          | Non-sensitive, client/build and server/runtime | Optional HTTP(S)-only URL                                                                                                                        | `apps/app/src/shared/env.ts:7-10`                   |
| TanStack app   | `PUBLIC_BASE_URL`                         | Non-sensitive, client/build and server/runtime | Required HTTP(S)-only URL                                                                                                                        | `apps/app/src/shared/env.ts:9`                      |
| Docs           | `PUBLIC_MARKETING_URL`, `PUBLIC_SITE_URL` | Non-sensitive, tool/build and client/build     | Optional URLs                                                                                                                                    | `apps/docs/src/shared/env.ts:5-13`                  |
| Web            | `PUBLIC_SITE_URL`                         | Non-sensitive, tool/build and client/build     | Optional URL                                                                                                                                     | `apps/web/src/shared/env.ts:5-12`                   |
| Convex backend | `CONVEX_SITE_URL`                         | Non-sensitive, deployment/runtime              | Required string, not URL-validated                                                                                                               | `packages/backend/src/functions/shared/env.ts:6-12` |

Desktop and extension declare empty application client contracts. Desktop extends the
Tauri preset (`apps/desktop/src/shared/env.ts:5-10`); extension extends no presets and
passes only `process.env` (`apps/extension/src/shared/env.ts:4-10`). Mobile declares
an empty application client contract, extends Expo Sentry, and uses the env module only
for its validation side effect (`apps/mobile/src/shared/env.ts:5-10`).

### Shared package ownership and evaluation

The present ownership is central rather than package-local: all package rules live in
`packages/env/src/presets.ts`. Actual shared packages import and call those presets:

| Package                  | Contract call                                         | Evaluation                                                              |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `packages/db`            | `db()`                                                | Lazy in `database()`, eager in Drizzle config, reset, and seed commands |
| `packages/email`         | `resend()`                                            | Lazy when the Resend singleton or send functions are used               |
| `packages/kv`            | `kv()`                                                | Lazy when the storage singleton is created                              |
| `packages/observability` | `sentry.client()`, `sentry.expo()`, `sentry.server()` | When the corresponding monitoring initializer runs                      |
| `packages/payments`      | `stripe()`                                            | Lazy when the Stripe client or webhook parser is used                   |

Evidence: `packages/db/src/client.ts:20-22`, `packages/db/drizzle.config.ts:5-17`,
`packages/email/src/client.ts:18-26`, `packages/kv/src/client.ts:8-10`,
`packages/observability/src/monitoring/client.ts:5-12`,
`packages/observability/src/monitoring/expo.ts:5-10`,
`packages/observability/src/monitoring/server.ts:5-12`,
`packages/payments/src/client.ts:5-9`, and `packages/payments/src/helpers.ts:98-107`.

This means the consuming application and the shared package can independently create
and validate the same preset. There is no package-local generated type or initialized
environment graph today.

## Template inventory

| Template                     | Active keys                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Commented optional/framework keys                                                                                       | Findings                                                                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/.env.template`     | `BASE_URL`, `ALLOWED_API_ORIGINS`, `PORT`, `FILES_API_SECRET`, `S3_ACCESS_KEY_ID`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_SECRET_ACCESS_KEY`, `AUTH_SECRET`, `AUTH_TRUSTED_ORIGINS`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`, `RUN_PRODUCTION_MIGRATIONS`, `REDIS_URL`, `INNGEST_BASE_URL`, `INNGEST_DEV`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `ARCJET_KEY`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_DEBUG`, `SENTRY_SPOTLIGHT`, `EMAIL_FROM`, `RESEND_API_KEY`, `MOCK_RESEND` | `INNGEST_SIGNING_KEY_FALLBACK`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `POSTHOG_HOST`, `POSTHOG_API_KEY` | `ARCJET_KEY` and both Upstash keys have no current schema declaration. PostHog has a reusable schema but the API does not extend it.                                    |
| `apps/app/.env.template`     | `PUBLIC_BASE_URL`, auth/provider keys, database keys, email keys, `PUBLIC_SENTRY_DSN`, `PUBLIC_SENTRY_DEBUG`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | None                                                                                                                    | Matches the default app composition. `PUBLIC_API_URL` is optional in the schema and is added by `connect-backend`, not shipped in the base template.                    |
| `apps/mobile/.env.template`  | `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_ORG`, `EXPO_PUBLIC_SENTRY_PROJECT`, `EXPO_PUBLIC_SENTRY_URL`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_DEBUG`                                                                                                                                                                                                                                                                                                                                                                                                                | `EXPO_PUBLIC_POSTHOG_HOST`, `EXPO_PUBLIC_POSTHOG_API_KEY`                                                               | The three public Sentry config keys are read directly by `app.config.ts` but are absent from the T3 schema. The schema separately requires unprefixed org/project keys. |
| `apps/desktop/.env.template` | None                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | All six `TAURI_ENV_*` keys, PostHog web keys, Sentry web keys                                                           | Only the Tauri keys have an active desktop contract. Optional package examples are not composed into the desktop env module.                                            |
| `apps/docs/.env.template`    | `PUBLIC_MARKETING_URL`, `PUBLIC_SITE_URL`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | None                                                                                                                    | Both schema keys are optional despite supplied defaults.                                                                                                                |
| `apps/web/.env.template`     | `PUBLIC_SITE_URL`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `PUBLIC_SENTRY_DSN`, `PUBLIC_SENTRY_DEBUG`                                                                              | Sentry is not composed into the web env module.                                                                                                                         |
| `packages/db/.env.template`  | `DATABASE_URL`, `RUN_PRODUCTION_MIGRATIONS`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | None                                                                                                                    | Duplicates the database values present in application templates for package-local commands.                                                                             |

There is no `apps/extension/.env.template`. Reusable contracts without a base template
consumer include both Convex client surfaces, Stripe, and all three PostHog surfaces.
Those are selection-time contracts; generator templates add Convex and backend API
client values when the relevant connection is selected
(`turbo/generators/commands/connect-backend.ts:192-198,281-298`).

## Turbo environment inventory

The root build task lists:

```text
AUTH_SECRET
DATABASE_URL
DATABASE_AUTH_TOKEN
EMAIL_FROM
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RESEND_API_KEY
SENTRY_AUTH_TOKEN
SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
```

`CI` is the sole root `globalPassThroughEnv` value (`turbo.json:1-28`).
`DATABASE_AUTH_TOKEN` has no schema, template, or direct access in the current
repository.

Workspace additions are:

| Workspace/task        | Listed keys                                                                                                                | Evidence                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| API build             | `INNGEST_BASE_URL`, `INNGEST_DEV`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `INNGEST_SIGNING_KEY_FALLBACK`, `REDIS_URL` | `apps/api/turbo.json:5-13`      |
| App build             | `PUBLIC_SENTRY_DEBUG`, `PUBLIC_SENTRY_DSN`                                                                                 | `apps/app/turbo.json:5-8`       |
| Web build and typegen | `PUBLIC_SITE_URL`                                                                                                          | `apps/web/turbo.json:5-11`      |
| Desktop build         | Empty list                                                                                                                 | `apps/desktop/turbo.json:5-8`   |
| Extension build       | Empty list                                                                                                                 | `apps/extension/turbo.json:5-8` |
| Docs build            | No workspace env list                                                                                                      | `apps/docs/turbo.json:5-7`      |

The baseline does not assume whether Varlock can infer or replace Turbo's cache-key and
strict-environment declarations. Plan 17 must test that separately. The inventory does
show that Turbo does not currently enumerate all values validated or consumed during
each build, including API-specific Files/S3 values, application base URLs, Expo values,
and Tauri-provided values.

## Direct environment access

These reads bypass an application or package's typed env object:

| Keys                                                                             | Consumer and purpose                                         | Classification                  | Evidence                                                                                                                                                                    |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_SENTRY_ORG`, `EXPO_PUBLIC_SENTRY_PROJECT`, `EXPO_PUBLIC_SENTRY_URL` | Expo config supplies the Sentry plugin before Metro          | Non-sensitive, tool/build       | `apps/mobile/app.config.ts:48-53`                                                                                                                                           |
| `PORT`                                                                           | Vite/Astro/WXT dev server configuration                      | Non-sensitive, tool/development | `apps/app/vite.config.ts:33-35`, `apps/desktop/vite.config.ts:45`, `apps/docs/astro.config.ts:127-129`, `apps/web/astro.config.ts:14-16`, `apps/extension/wxt.config.ts:12` |
| `TAURI_DEV_HOST`                                                                 | Tauri Vite host and HMR                                      | Non-sensitive, tool/development | `apps/desktop/vite.config.ts:12,38-45`                                                                                                                                      |
| `TAURI_ENV_DEBUG`, `TAURI_ENV_PLATFORM`                                          | Tauri Vite minification, source maps, and browser target     | Non-sensitive, tool/build       | `apps/desktop/vite.config.ts:15-18`                                                                                                                                         |
| `NODE_ENV`                                                                       | Selects the Astro environment mode                           | Framework-owned, tool/build     | `apps/docs/astro.config.ts:12`, `apps/web/astro.config.ts:9`                                                                                                                |
| `DEV`, `PROD` through `import.meta.env`                                          | Development UI/logger behavior and generated backend clients | Framework-owned, client/build   | `apps/app/src/routes/__root.tsx:40`, `apps/desktop/src/routes/__root.tsx:12`, app/desktop/extension logger modules, backend client templates                                |

`tooling/env` also mutates `process.env` with every value returned by Vite `loadEnv`
(`tooling/env/src/vite.ts:8-10`). `packages/env/src/runtime.ts` merges
`import.meta.env` and `std-env` with `std-env` taking precedence
(`packages/env/src/runtime.ts:5-7`). App, desktop, docs, and web repeat a similar merge
inline; API, mobile, extension, and Convex pass only `process.env`.

Generated template code adds direct access to `process.env.NODE_ENV`,
`import.meta.env.DEV`, and `import.meta.env.PROD`; generated clients otherwise consume
the application's typed env object for `PUBLIC_API_URL`, `EXPO_PUBLIC_API_URL`, and
Convex public URLs.

## Current parsing and validation behavior

| Behavior                   | Current result                                                                                                                                                                                                   | Evidence                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Boolean strings            | `z.stringbool().default(false)` parses values such as `"true"` to booleans for database migrations, mocked email, Inngest, Sentry, and Tauri debug                                                               | Preset declarations and controlled import below                                   |
| Port                       | `PORT` is coerced to a number and defaults to `3000` in the API schema; framework config ports use unvalidated `Number(process.env.PORT ?? default)`                                                             | `apps/api/src/shared/env.ts:32` and direct access table                           |
| URLs                       | Most URLs use `z.url()`; application public URLs restrict protocols to HTTP(S); trusted origins use four regex branches; S3 endpoint, Sentry DSNs, and Convex's deployment URL use plain strings                 | Contract tables above                                                             |
| Arrays                     | Trusted origins split, trim, remove blanks, and validate entries. API allowed origins split and trim without URL validation or blank removal                                                                     | `packages/env/src/presets.ts:17-38`, `apps/api/src/shared/env.ts:22-29`           |
| Defaults                   | Boolean defaults and API port defaults are applied during parsing                                                                                                                                                | Contract tables above                                                             |
| Optional values            | Inngest base/fallback keys, Portless URL, S3 endpoint/region, Tauri strings, and selected public application URLs are optional                                                                                   | Contract tables above                                                             |
| Minimum-length secrets     | Only `FILES_API_SECRET` has an explicit minimum length (`32`)                                                                                                                                                    | `apps/api/src/shared/env.ts:31`                                                   |
| Environment-specific rules | There are no development-only defaults or production-only schema requirements. The migration safety rule is imperative in Drizzle config, and nearly all validation is disabled whenever `std-env` identifies CI | `packages/db/drizzle.config.ts:7-10`, preset/application `skipValidation` options |
| Client boundary            | T3 Env uses `clientPrefix` (`PUBLIC_`, `EXPO_PUBLIC_`, or `TAURI_ENV_`) plus separate client/server schema sections. There is no independent sensitivity annotation                                              | `packages/env/src/constants.ts:1-3` and all client schemas                        |

### Controlled failure

The API env module was imported from a fresh temporary directory with an otherwise
empty environment so Bun could not load the repository's local env files:

```sh
baseline_tmp_dir=$(mktemp -d)
cd "$baseline_tmp_dir"
env -i PATH=/usr/bin:/bin:/opt/homebrew/bin /opt/homebrew/bin/bun \
  -e 'await import("/Users/adelrodriguez/Developer/init/apps/api/src/shared/env.ts")'
```

Result: exit status `1`. T3 Env printed structured issues for missing
`AUTH_SECRET` and `AUTH_TRUSTED_ORIGINS`, then threw `Error: Invalid environment
variables`. Validation stops at the first independently created extended preset, so
the output does not aggregate all missing application and package values.

### Controlled success

The same import was run with synthetic values for every required API and extended
preset key. No repository or real deployment secret was used. The probe printed only
non-sensitive parsed results:

```sh
baseline_tmp_dir=$(mktemp -d)
cd "$baseline_tmp_dir"
env -i PATH=/usr/bin:/bin:/opt/homebrew/bin \
  AUTH_SECRET=test \
  AUTH_TRUSTED_ORIGINS=https://example.com \
  GITHUB_CLIENT_ID=test GITHUB_CLIENT_SECRET=test \
  GOOGLE_CLIENT_ID=test GOOGLE_CLIENT_SECRET=test \
  DATABASE_URL=postgresql://user:pass@localhost:5432/db \
  REDIS_URL=redis://localhost:6379 \
  INNGEST_EVENT_KEY=test INNGEST_SIGNING_KEY=test \
  EMAIL_FROM=test@example.com RESEND_API_KEY=test \
  S3_ACCESS_KEY_ID=test S3_BUCKET=test S3_SECRET_ACCESS_KEY=test \
  SENTRY_AUTH_TOKEN=test SENTRY_DSN=https://public@example.invalid/1 \
  SENTRY_ORG=test SENTRY_PROJECT=test \
  ALLOWED_API_ORIGINS=https://example.com BASE_URL=https://api.example.com \
  FILES_API_SECRET=12345678901234567890123456789012 PORT=4310 \
  RUN_PRODUCTION_MIGRATIONS=true MOCK_RESEND=true \
  /opt/homebrew/bin/bun -e \
  'const {default: env}=await import("/Users/adelrodriguez/Developer/init/apps/api/src/shared/env.ts"); console.log(JSON.stringify({port:env.PORT,portType:typeof env.PORT,origins:env.ALLOWED_API_ORIGINS,runProductionMigrations:env.RUN_PRODUCTION_MIGRATIONS,mockResend:env.MOCK_RESEND}))'
```

```json
{
  "port": 4310,
  "portType": "number",
  "origins": ["https://example.com"],
  "runProductionMigrations": true,
  "mockResend": true
}
```

Result: exit status `0`. This confirms number, array, and boolean coercion in the
current composed API schema.

### CI escape hatch

With `CI=true` and no required values, importing the API env module exits `0`:

```sh
baseline_tmp_dir=$(mktemp -d)
cd "$baseline_tmp_dir"
env -i PATH=/usr/bin:/bin:/opt/homebrew/bin CI=true /opt/homebrew/bin/bun \
  -e 'await import("/Users/adelrodriguez/Developer/init/apps/api/src/shared/env.ts"); console.log("CI import completed without required values")'
```

Observed output: `CI import completed without required values`.

Mobile behaves differently. The equivalent isolated import with `CI=true` exits `1`
and reports missing `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and
`EXPO_PUBLIC_SENTRY_DSN`. The outer mobile schema skips validation, but
`sentry.expo()` validates before it is passed to `extends` and does not set
`skipValidation: isCI`.

```sh
baseline_tmp_dir=$(mktemp -d)
cd "$baseline_tmp_dir"
env -i PATH=/usr/bin:/bin:/opt/homebrew/bin CI=true /opt/homebrew/bin/bun \
  -e 'await import("/Users/adelrodriguez/Developer/init/apps/mobile/src/shared/env.ts")'
```

## Duplicates, inconsistencies, and migration risks

1. **Expo Sentry has two uncoordinated contracts.** The template and `app.config.ts`
   use `EXPO_PUBLIC_SENTRY_ORG`, `EXPO_PUBLIC_SENTRY_PROJECT`, and
   `EXPO_PUBLIC_SENTRY_URL`, none of which is declared in T3 Env. The Expo Sentry
   preset instead requires unprefixed `SENTRY_ORG` and `SENTRY_PROJECT`, plus the auth
   token and public DSN. This is the explicit first framework-boundary case for the
   Varlock spike.
2. **CI validation is broadly disabled and internally inconsistent.** Nearly every
   schema sets `skipValidation: isCI`, allowing required deployment values to be
   absent. Expo Sentry accidentally remains strict, so mobile has different CI
   behavior from the other applications.
3. **Package requirements are centrally declared and often validated twice.** An
   application constructs package presets in `extends`, while the shared package calls
   the same factory when used. This is the behavior against which package-local
   Varlock modules and one application-initialized graph must be compared.
4. **Templates contain undeclared keys.** `ARCJET_KEY`,
   `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` have no active schema.
   Expo's three public Sentry config keys are direct, untyped reads.
5. **Schemas contain keys absent from base templates.** Convex client URLs, Stripe,
   PostHog, and `PORTLESS_URL` are declared without base template entries. Some are
   intentionally selection-time or framework-provided, but composition must preserve
   that distinction instead of making every selectable package mandatory.
6. **Turbo contains a stale or future key.** `DATABASE_AUTH_TOKEN` is in the root build
   environment list but has no schema, template, or consumer.
7. **Validation fidelity varies by similarly shaped values.** Public app URLs are
   HTTP(S)-only, general URLs accept any URL supported by Zod, trusted origins have
   custom regex rules, S3 endpoint is only a string, and Convex's site URL is only a
   string. Varlock fidelity tests must preserve these intentional cases or classify
   their simplification.
8. **Client safety currently depends on schema partition plus naming prefixes.** The
   contract has no explicit sensitive/non-sensitive metadata. Plan 17 must demonstrate
   that client artifacts cannot receive sensitive values even when framework config,
   shared package transforms, or build tooling operates outside the ordinary app env
   module.
9. **Loader ownership differs materially by workspace.** Vite-family workspaces use a
   mutating custom loader, Bun relies on its process environment behavior, Expo reads
   config before Metro and validates again at application entry, Tauri injects build
   values, and Convex owns deployed runtime values. A successful local `varlock load`
   alone would not cover these paths.

## Baseline conclusions

- The repository currently has one central reusable contract catalog and eight root
  env modules: seven application workspaces plus the Convex backend. There is no root
  env module for a standalone shared package, although database tooling calls its
  preset directly.
- T3 Env plus Zod currently provides the coercions and type shapes that the Varlock
  spike must match: arrays, booleans, numbers, defaults, optionals, regex-constrained
  origins, protocol-constrained URLs, and a minimum-length secret.
- Prefixes are doing double duty as exposure policy and framework integration. The
  Varlock spike must replace that implicit coupling with an explicit, testable bundle
  boundary.
- The first implementation spike should be additive: retain `@init/env`,
  `@tooling/env`, existing env modules, and all `.env.template` files while building a
  representative Varlock contract beside them.

## Next checkpoint

Proceed to Plan 17 section 2 with additive representative schemas and local generated
modules. The first vertical fidelity fixture should cover:

- `ALLOWED_API_ORIGINS` and `AUTH_TRUSTED_ORIGINS` array parsing;
- `PORT`, `RUN_PRODUCTION_MIGRATIONS`, and `MOCK_RESEND` coercion/defaults;
- HTTP-only and wildcard/custom-protocol origin rules;
- `INNGEST_BASE_URL`, S3 endpoint/region, and `PUBLIC_API_URL` optionals;
- the 32-character `FILES_API_SECRET` rule;
- optional Tauri-provided variables; and
- development-only defaults and production-only requirements, which have no current
  T3 Env equivalent and therefore need an explicit proposed contract.

The overall Pass/Conditional pass/Fail decision remains pending until the later
framework, deployment, secret-store, and scaffold-selection checkpoints are complete.
