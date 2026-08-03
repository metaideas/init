# Plan 17 — Validate Varlock across init

**Status:** Planned
**Size:** M

Determine whether Varlock can replace T3 Env and init's custom environment-loading
tooling across every selectable workspace without weakening type safety, secret
boundaries, deployment behavior, or scaffold composition. Treat this as a decision
gate: do not begin the repository-wide migration in Plan 18 until this plan records a
passing result.

The validation must prioritize the boundaries where framework ownership of the
environment differs from ordinary Node or Vite applications: Expo and EAS, Convex,
WXT, shared package workspaces, Tauri build variables, and external secret stores.
Success is not merely getting `varlock load` to pass locally. The spike must prove that
the same contract survives development, code generation, bundling, deployment, and
runtime access without exposing sensitive values.

## Questions to answer

1. Can each application workspace own one complete `.env.schema` while importing
   reusable contracts from selected package workspaces?
2. Can shared packages such as `db`, `email`, `payments`, and `observability` use a
   locally generated typed `ENV` while the consuming application initializes the
   resolved Varlock graph?
3. Do package-local generated modules avoid `ProcessEnv`, `ImportMetaEnv`, and global
   `varlock/env` augmentation conflicts across the monorepo?
4. Does Varlock preserve init's current parsing behavior, including booleans, ports,
   URLs, defaults, optional values, arrays, regex-constrained strings, and values that
   are required only in selected environments?
5. Can every client-capable workspace distinguish bundle-safe configuration from
   sensitive configuration without relying only on a naming prefix?
6. Can CI and deployment validate real required values instead of using the current
   `skipValidation: isCI` escape hatch?
7. Can a supported secret store supply development and deployment values with a small,
   well-defined secret-zero requirement and useful failure behavior?
8. Does Varlock compose with init's workspace selection and cleanup behavior after a
   scaffolded project no longer contains every application and package workspace?

## 1. Establish the spike and baseline

Record the current environment behavior before introducing Varlock:

- inventory every key declared in `packages/env`, every application env module, every
  `.env.template`, `turbo.json`, and every direct `process.env` or `import.meta.env`
  access;
- classify each key as sensitive or non-sensitive, build-time or runtime, required or
  optional, and identify the workspace that owns the requirement;
- identify duplicate and inconsistent declarations, including Expo configuration keys
  that differ between `app.config.ts`, the Sentry preset, and `.env.template`;
- capture representative success and failure output from the existing T3 Env setup;
- note which commands rely on Bun, Expo, Vite, Astro, WXT, Tauri, Convex, Drizzle, or
  another tool loading `.env` before application code runs.

Implement the spike narrowly enough that it can be reviewed or removed independently.
Do not delete `@init/env`, `@tooling/env`, `.env.template` files, or existing env modules
during validation. Temporary integration code may live beside the current path, but
the existing path remains the baseline until the decision gate passes.

Write findings to `docs/template/research/varlock-validation.md`. Include exact tested
versions, commands, relevant deployment targets, evidence links or captured output,
and any result that could not be tested because it required unavailable credentials or
infrastructure.

## 2. Prove schema fidelity and generated types

Create representative schemas covering the hardest existing rules:

- `ALLOWED_API_ORIGINS` and `AUTH_TRUSTED_ORIGINS` as parsed arrays;
- URL rules with HTTP-only, wildcard-origin, localhost, and custom-protocol cases;
- `PORT` as a number/port and boolean defaults such as
  `RUN_PRODUCTION_MIGRATIONS`, `MOCK_RESEND`, and Sentry debug flags;
- optional values such as `INNGEST_BASE_URL`, S3 endpoint/region, and
  `PUBLIC_API_URL`;
- minimum-length secrets such as `FILES_API_SECRET`;
- framework-provided Tauri variables that may be absent outside a Tauri command;
- development-only defaults and production-only requirements.

Generate package-local TypeScript modules with `exposeEnv=local` and no
`process.env`/`import.meta.env` augmentation. Verify with type tests that values are
coerced to their expected output types, unknown keys fail type checking on the local
module, and generated declarations from different workspaces do not merge.

Document any Zod behavior that cannot be represented faithfully in Varlock's schema
language. Classify each mismatch as acceptable simplification, custom Varlock extension,
or blocking loss of validation.

## 3. Resolve schema ownership for shared packages

Test a vertical slice containing an application and real shared package workspaces,
not a standalone fixture. At minimum use:

- `apps/api` with `packages/db` and `packages/email`;
- `apps/mobile` with `packages/observability`;
- one web client with `packages/payments` or another shared runtime consumer.

Compare these ownership models:

1. contracts centrally stored under `packages/env` and imported by applications;
2. each package owning flat `env/<surface>.env` contract fragments plus a package
   `.env.schema` and generated local module, with application schemas importing the
   relevant package surfaces;
3. application-only schemas with packages receiving configuration explicitly.

Treat the second model as the preferred candidate. Use one fixed surface vocabulary:

- `env/shared.env` for non-sensitive configuration used across runtimes;
- `env/client.env` for configuration permitted in browser or native bundles;
- `env/server.env` for server-runtime configuration;
- `env/build.env` for build and deployment tooling.

Packages create only applicable surface files but never invent package-specific surface
names. A server-only package such as `packages/db` therefore owns
`env/server.env`; a multi-surface package such as `packages/observability` may own all
four. Do not introduce one directory per surface or generic names such as
`env/preset.env`.

Every independently runnable application owns a root `.env.schema` that imports the
relevant package surface files and declares application-specific items. A configurable
package may also own a root `.env.schema` for its commands and package-local type
generation; reusable surface files must not carry root policy such as environment
selection, default sensitivity, or application-specific generation paths.

Prefer this package-owned model if it allows each selectable package to declare its own
requirements without reintroducing a runtime dependency on `@init/env`. Prove that:

- the package's generated `ENV` resolves against the consuming application's initialized
  graph;
- Vite and Metro transform `ENV.KEY` references inside workspace package source;
- server-only package code cannot leak into browser, extension, desktop, or native
  bundles;
- tree-shaken optional package code does not make unrelated variables required;
- schema imports remain valid after template setup removes unselected workspaces;
- root decorators from package composition schemas cannot leak into applications that
  import only the flat surface files;
- the four surfaces are sufficient for existing packages without duplicating keys or
  introducing framework-specific names such as `expo.env` by default;
- Turbo and Adamantite understand the resulting package dependencies even though
  Varlock schema imports are file references rather than TypeScript imports.

The research report must select one ownership model before Plan 18 proceeds.

## 4. Validate Expo, EAS, and Sentry

Compose `@varlock/expo-integration` with the existing Expo Babel preset, Sentry Metro
configuration, and Uniwind Metro wrapper. Exercise:

- Expo development for iOS, Android, and web where locally available;
- production JavaScript export and native prebuild;
- an EAS development/preview build and production build when project credentials are
  available;
- EAS Update behavior, even though updates are currently disabled, to document whether
  non-sensitive values are frozen into the update bundle;
- Expo Router universal pages and a representative `+api` route;
- `app.config.ts` values evaluated before Metro starts;
- Sentry organization/project configuration and source-map upload using a sensitive
  auth token.

Demonstrate that a non-sensitive typed value is inlined and correctly coerced. Add a
deliberate sensitive access in native code and confirm both build feedback and runtime
failure. Confirm that a sensitive value can be used only in the intended server route.

Inspect production JavaScript, source maps, Expo manifests, native generated files, and
captured logs for known canary secrets. No canary secret may appear outside an
explicitly approved server-side artifact. Record whether Expo config commands need
`varlock run` in addition to the Babel/Metro integration.

## 5. Validate Convex

Convex is a deployment-owned runtime and must not be treated as ordinary Bun server
code. Treat `packages/backend` as an intentional native exception rather than building
a Varlock runtime or secret-synchronization adapter for deployed Convex functions.

Use Convex's native environment declarations in `convex.config.ts`, its generated typed
`env` object inside functions, and its deployment-owned environment values. Keep narrow
local parsing for values whose application shape is richer than Convex's supported
string/literal/union/optional validators. Use Convex system variables such as
`CONVEX_SITE_URL` directly instead of redeclaring or synchronizing them.

Prove that imported init packages do not need to bring their environment contracts into
Convex. The preferred boundary is explicit configuration: `@init/auth` exposes factories
and constants, while the Convex composition root declares `AUTH_SECRET` and
`AUTH_TRUSTED_ORIGINS`, parses them locally, and passes them into the auth factory. Apply
the same rule to future email, analytics, storage, or other integrations. If a package
entrypoint reads environment variables internally, either refactor it to accept explicit
configuration or record why the backend must declare the same requirement natively;
do not import a Varlock surface into Convex merely to share a key name.

Test:

- `convex dev`, function bundling, code generation, and local dashboard values;
- required, optional, and enum-like native declarations in `convex.config.ts`;
- generated typed `env` access from queries, mutations, actions, and HTTP actions;
- local parsing of `AUTH_TRUSTED_ORIGINS` and use of the guaranteed
  `CONVEX_SITE_URL` system value;
- validation failure before deployment when a required Convex value is absent;
- distinct development, preview, and production deployment values using Convex's
  native dashboard/CLI/default mechanisms;
- coexistence between Convex-managed `.env.local` outputs and Varlock-managed
  application environments without conflicting loaders or ownership;
- application-side Convex URLs managed by each consuming application's Varlock schema
  and updated by the existing backend-connection template command;
- current and representative future backend package imports to confirm that they are
  environment-independent or explicitly configured.

The research report must describe Convex as an independent environment subsystem,
including where its deployment values and deploy keys are configured. Do not require a
Varlock schema, `varlock/env`, custom Varlock generator, or Varlock-to-Convex value sync
for `packages/backend` unless this native model fails a concrete requirement during the
spike.

## 6. Validate WXT, Tauri, and standard integrations

For WXT, add the Varlock Vite integration through WXT's supported configuration seam
and build background, content-script, popup, and other selected entrypoints for Chrome
and Firefox. Verify that public values are available in each intended entrypoint,
sensitive values are rejected, and canary secrets are absent from distributable
archives and source maps. If the ordinary Vite plugin is incompatible, determine the
size and stability of the adapter required.

For Tauri, confirm that Vite sees `TAURI_ENV_*` values supplied by Tauri commands,
optional validation still works in ordinary tooling commands, and sensitive backend
values cannot be bundled into the webview. Build or inspect both development and
production configurations on an available target.

Smoke-test the first-party Vite and Astro integrations against `apps/app`, `apps/web`,
and `apps/docs`. Confirm SSR/runtime behavior for the actual deployment adapters rather
than assuming all Vite applications are static clients.

## 7. Validate secret-store and CI behavior

Select at least one Varlock-supported secret-store integration that reflects intended
init usage and can authenticate non-interactively in CI. The exact provider is not an
upstream default unless the validation produces a compelling reason; scaffold owners
must be able to choose another supported provider or plain deployment secrets.

Verify:

- local interactive authentication and non-interactive CI authentication;
- the minimum secret-zero value required to resolve the remaining graph;
- development, preview, and production separation;
- actionable behavior when offline, unauthenticated, or denied access;
- redaction from CLI output, application logs, build logs, cache artifacts, and error
  reporting;
- rotation without editing application source or schemas;
- `varlock load` validation without unnecessarily exposing resolved secret values;
- no resolved secret is committed in schemas, generated modules, fixtures, or snapshots.

Add an `env:check` prototype that runs per workspace through Turbo. Determine whether
Bun's automatic `.env` loading must be disabled globally or only for Varlock-managed
commands, and test the effect on generators, tests, Drizzle, Expo, Convex, and local
infrastructure scripts.

## 8. Exercise scaffold selection

Create disposable scaffolded projects representing at least:

- API plus database/auth packages;
- `apps/app` as an independently full-stack application without `apps/api` or another
  application workspace;
- Expo plus Convex;
- Expo plus Hono API;
- web-only static applications;
- desktop or extension without the API;
- a minimal project that omits the environment tooling workspace if that remains
  selectable.

Run setup, environment validation, type generation, checks, and targeted builds in each
shape. No schema may import a removed workspace, and no generated module may retain a
key from an unselected preset. Update the research report with the resulting schema
composition rules that template commands must enforce.

## Decision gate

Finish the research report with one result: **Pass**, **Conditional pass**, or **Fail**.

The result is **Pass** only when:

- Expo/EAS, WXT, Convex, Tauri, Bun, Vite, and Astro have a proven path;
- sensitive canary values are absent from all tested client artifacts and logs;
- shared package ownership and local generated types work without global augmentation;
- CI validates required deployment values instead of skipping them;
- a secret-store workflow succeeds locally and non-interactively;
- representative scaffolded project shapes validate and build;
- no known blocker requires a maintained fork of Varlock.

A **Conditional pass** may contain narrow, documented adapters for WXT or
configuration-time tools, but every adapter must have an owner, tests, and an estimated
maintenance cost. Convex's independently validated native environment subsystem is an
intentional boundary, not a Varlock adapter. Moving forward from a conditional pass
requires an explicit upstream template decision accepting the remaining exceptions.

The result is **Fail** if any client can receive a sensitive value, deployment
validation cannot be made reliable, package contracts cannot compose after workspace
selection, or a critical integration depends on unstable internal APIs.

If the result is Pass—or a Conditional pass is explicitly accepted—record the upstream
decision in `docs/template/adr/` and change Plan 18 from gated to active. Otherwise,
leave the current T3 Env path in place and record the rejected approach and evidence.

## Verification

The research report should contain the exact commands used. At minimum, run the
applicable subset of:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
bun run env:check
bun run build --filter=api
bun run build --filter=app
bun run build --filter=mobile
bun run build --filter=extension
bun run build --filter=desktop
bun run build --filter=web
bun run build --filter=docs
```
