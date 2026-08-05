# Plan 18 — Adopt Varlock across init

**Status:** Implemented (Plan 17 gate explicitly waived 2026-08-05)
**Size:** L

Replace T3 Env and init's overlapping environment loaders with Varlock after Plan 17
records a Pass, or after an explicit upstream decision accepts a Conditional pass.
Implement the schema ownership model, framework adapters, and deployment behavior
selected by the validation report rather than revisiting those decisions during the
migration.

Do not start this plan merely because the ordinary Bun, Vite, or Expo happy path works.
The gate includes the difficult workspace results, client artifact inspection, shared
package behavior, secret-store workflow, and scaffold-selection matrix from Plan 17.

## Decision

Before changing production paths, add an ADR under `docs/template/adr/` that records:

- why the template adopts Varlock instead of maintaining a Metaideas env package;
- the chosen schema ownership model for application and package workspaces;
- how sensitive, non-sensitive, build-time, and runtime values are represented;
- which secret-store behavior is supported by default versus left to scaffold owners;
- Convex's native environment subsystem as an intentional independent exception, plus
  accepted adapters for WXT, Expo configuration, Tauri, or other deployment-owned
  runtimes;
- how `.env.schema`, local overrides, generated TypeScript, and deployment platforms
  divide ownership;
- why global environment type augmentation remains disabled.

Treat this as an upstream template decision. Scaffold owners may replace Varlock later,
but a newly scaffolded project must receive one coherent environment system.

## 1. Establish dependency and tooling topology

Install the validated Varlock version and only the integration packages required by
selected application workspaces. Keep framework integrations in the workspaces that
configure their bundlers instead of making every workspace depend on Expo, Vite,
Astro, or a deployment adapter.

Apply the validated Bun strategy:

- disable Bun's automatic env loading globally only if Plan 17 proved all repository
  commands remain correct;
- otherwise wrap Varlock-managed commands or use the appropriate Bun flag;
- prevent two loaders with different precedence rules from populating the same process.

Add repository scripts for environment validation and generated types. Integrate them
with Turbo so code generation happens before type checking/building and deployment
validation is not incorrectly cached. Declare relevant environment inputs or pass-
through values so Turbo neither serves stale outputs nor invalidates every task for
unrelated secrets.

Pin or constrain generated artifacts according to the validation decision. If generated
TypeScript is committed, require deterministic regeneration and a clean-tree CI check.
If it is ignored, ensure setup, install, check, editor startup, and targeted builds all
produce it before TypeScript needs it.

## 2. Introduce package-owned contracts and application schemas

Implement the schema ownership model selected in Plan 17. The expected default is:

- a package workspace owns reusable contract fragments under `env/`, using only the
  applicable names `shared.env`, `client.env`, `server.env`, and `build.env`;
- package surface contracts remain flat files such as `env/server.env`, not
  `env/preset.env` or nested `env/server/.env.schema` directories;
- it generates a package-local typed `ENV` module for internal imports;
- an application workspace owns the complete resolved graph for its process or bundle;
- the application root `.env.schema` imports the relevant surface contracts for
  selected packages and adds its own keys;
- tooling-only values are declared by the workspace or command that consumes them.

Apply these surface meanings consistently:

- `shared.env`: non-sensitive values used across runtimes;
- `client.env`: values explicitly permitted in browser or native bundles;
- `server.env`: server-runtime values, including sensitive values;
- `build.env`: values consumed by build, upload, or deployment tooling and never by a
  client runtime.

Packages create only the surfaces they need. Do not create empty files merely to fill
all four slots, and do not introduce framework-specific surfaces unless Plan 17 proves
that an existing contract cannot be represented by the standard vocabulary. A package
root `.env.schema` may compose its surfaces for package-owned commands and local type
generation, but root policy stays out of reusable surface files.

Migrate every Varlock-owned preset and declaration, including auth/providers, database,
Inngest, KV, Portless, Resend, S3, Sentry variants, Stripe, PostHog, and Tauri. Migrate
the Convex backend separately to its native environment declaration and generated
`env` API. Preserve current coercion and validation unless Plan 17 explicitly accepted
a behavior change. Add descriptions and sensitivity metadata while the ownership
context is clear.

Avoid a new central schema dumping ground. Keep a small shared environment workspace
only if it provides a real reusable contract or command boundary after package-owned
schemas are in place. Do not retain `@init/env` solely to preserve its name.

Each application schema must be readable as its complete environment contract. Use
explicit imports, do not require keys for packages omitted from that application, and
keep environment selection consistent across workspaces.

The intended layout is:

```text
packages/db/
├── env/
│   └── server.env
├── .env.schema
└── src/
    └── env.generated.ts

packages/observability/
├── env/
│   ├── shared.env
│   ├── client.env
│   ├── server.env
│   └── build.env
└── .env.schema

apps/api/
├── .env.schema
└── src/shared/
    └── env.generated.ts
```

## 3. Replace runtime env APIs

Generate local TypeScript modules with `exposeEnv=local` and environment augmentation
disabled. Import the generated `ENV` binding directly:

```ts
import { ENV } from "#shared/env.generated.ts"
```

Client-visible code must preserve the literal uppercase `ENV.<KEY>` identifier because
Varlock's Vite and Expo integrations use that syntax for static replacement. Do not
alias the generated binding to lowercase `env`.

Update shared packages to import their package-local generated environment module or
receive explicit configuration, following the ownership decision. Remove imports of
resolved preset objects such as `db`, `resend`, `stripe`, `kv`, and `sentry` from
`@init/env/presets`.

Replace direct application accesses to project-defined `process.env` and
`import.meta.env` with typed `ENV` access. Retain framework-owned flags such as
`import.meta.env.DEV` only when they are not project configuration and the framework
contract remains the correct owner. Keep necessary compatibility access in deployment
configuration files only when documented by the ADR.

## 4. Integrate each application workspace

Apply the framework path proven by Plan 17:

- `apps/api`: Bun/JavaScript initialization and command wrapping;
- `apps/app`: Varlock's Vite or deployment-specific TanStack Start integration;
- `apps/web` and `apps/docs`: the Astro integration appropriate to their adapters;
- `apps/mobile`: Babel and Metro integration composed with Sentry and Uniwind;
- `apps/desktop`: Vite integration with Tauri-provided build variables;
- `apps/extension`: the validated WXT/Vite adapter;
- `packages/backend`: Convex-native declarations in `convex.config.ts`, generated typed
  `env` access, and local parsing without Varlock runtime or synchronization.

Remove `@tooling/env/vite` after all consumers use their framework integration. Remove
`getRuntimeEnv()` and prefix constants when no remaining caller needs them. Do not use
public prefixes as the security boundary; sensitivity metadata and framework
integration own that boundary. Retain prefixes temporarily only where migration,
third-party tooling, or platform conventions make them valuable.

Preserve bundler/plugin ordering established by the validation spike. Add focused tests
or configuration assertions around integrations whose order is security- or
correctness-sensitive.

## 5. Implement deployment and secret-store workflows

Add the provider-neutral Varlock workflow proven in Plan 17. Document how a scaffold
owner can use plain platform secrets or configure a supported secret store. Do not make
a maintainer's personal vault, organization, item identifiers, or account topology part
of the template.

For the validated reference provider, include:

- schema reference examples without real identifiers or values;
- local login/setup instructions;
- non-interactive CI authentication and secret-zero handling;
- development, preview, and production separation;
- rotation and access-denied recovery;
- redaction expectations and artifact checks.

Implement the accepted deployment paths for EAS, server hosting, static builds, and any
worker adapter in the repository. Validation must happen before mutation of a remote
deployment. Secret synchronization commands must identify their target environment
explicitly and must not print resolved values.

Keep Convex runtime values in Convex's deployment environment and manage them through
its native dashboard, CLI, project defaults, and deploy-key workflow. Do not synchronize
Varlock-resolved secrets into Convex. Document Convex deployment values and deploy keys
as a separate operational boundary, while consuming applications continue to manage
their non-sensitive Convex URLs through their own Varlock schemas.

## 6. Replace `.env.template` and update template commands

Make `.env.schema` the authoritative list of keys, types, requirements, sensitivity,
descriptions, and safe defaults. Decide from the validation result whether local
development value files remain copy-once template recipes or are generated/resolved by
Varlock.

Update every template command that currently edits `.env.template`, especially backend
connection flows. Commands must compose or remove schema imports and application-owned
keys idempotently when workspaces are selected, connected, disconnected, or omitted.
Avoid string insertion that can silently duplicate decorators or leave a schema import
pointing to a removed workspace.

Migrate the environment branch of `turbo/generators/commands/code-snippets.ts` to add
package-owned contract fragments and application schema imports under the selected
ownership model, or remove the branch if Varlock makes those snippets unnecessary.
Remove `templates/code-snippets/environment-presets.ts.hbs` when it no longer has a
consumer; the command must not read or modify the deleted `packages/env/src/presets.ts`.

Update internal cleanup paths and dependency removal so a scaffolded project retains
only the integrations, schemas, scripts, and generated modules needed by its selected
workspaces. Ensure removing a package also removes its contract import without removing
similarly named application-owned keys.

Delete obsolete `.env.template` files only after all documentation, template commands,
and local setup flows use the replacement. If a value template remains for convenient
local defaults, generate or audit it from the schema so it cannot become a second
contract.

## 7. Add tests and security assertions

Add focused tests alongside custom adapters and template commands. Cover:

- package contract composition and removal;
- deterministic local type generation without global augmentation;
- required/optional/default behavior across development, test, preview, and production;
- parsed arrays, booleans, numbers, URLs, and constrained strings;
- application schemas containing exactly the selected package contracts;
- Convex-native required-variable validation, generated `env` types, local parsing, and
  coexistence with Varlock-managed consuming applications;
- WXT and Expo integration configuration;
- failure before build/deploy when a required value is missing;
- redaction and deliberate canary-secret rejection.

Add artifact inspection for representative mobile, extension, web, desktop, and source-
map outputs. Use synthetic canary values only. Tests must fail when a sensitive canary
appears in a client artifact, generated file, snapshot, or captured log.

## 8. Remove the old implementation

Once every caller has migrated:

- remove `@t3-oss/env-core`;
- remove `packages/env/src/runtime.ts`, T3-based presets, constants, reset declarations,
  and obsolete Vite env declarations;
- remove `std-env` dependencies that existed only for runtime env merging or
  `skipValidation`;
- remove `@tooling/env` if it has no remaining responsibility;
- remove Zod/schema imports used only for environment validation while preserving the
  shared schema utilities used elsewhere;
- clean package exports, dependency declarations, Turbo env lists, TypeScript includes,
  and Adamantite/Knip configuration.

Do not leave a compatibility wrapper that validates twice or presents stale T3 Env
semantics over Varlock. A short-lived migration shim is acceptable only within this
plan and must be removed before completion.

## 9. Document the scaffold-owner experience

Update root and workspace documentation with:

- where application and package contracts live;
- how to add, rename, deprecate, or remove a key;
- how to mark a value sensitive, non-sensitive, dynamic, required, or environment-
  specific;
- how to regenerate types and validate locally;
- how development, tests, CI, preview, and production select values;
- how to configure a secret store without committing resolved values;
- framework-specific notes for Expo/EAS, WXT, Tauri, Astro, and TanStack Start;
- the independent Convex environment workflow, including native declarations,
  deployment values, generated `.env.local` outputs, deploy keys, and consuming
  application URLs;
- how template commands modify contracts after workspace selection.

Replace documentation that tells users to compare `.env.local` with `.env.template`.
Explain that client availability is explicit sensitivity/bundling metadata, not proof
that a value is secret merely because it lacks a public prefix.

## 10. Verify complete and scaffolded repository shapes

Run repository-wide formatting, checks, dependency analysis, monorepo consistency, and
tests. Build each selected application with synthetic valid environments and assert
expected failures with incomplete production environments.

Repeat the scaffold matrix from Plan 17 using the real template commands. For each
shape, verify setup from a clean clone, type generation, editor-visible types, local
development startup, targeted builds, and the absence of dangling schema imports or
unused integration dependencies.

Plan 18 is complete only when the old env system is removed, all supported deployment
boundaries have one documented path, and client artifact scans pass.

## Verification

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
bun run env:check
bun run codegen
bun run build
```

Also run the deployment-specific dry runs, EAS/Convex checks, artifact scans, and
disposable scaffold matrix recorded by Plan 17. Commands requiring external credentials
must use test projects and synthetic secrets, and their successful evidence must be
captured without recording secret values.
