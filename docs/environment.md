---
title: Environment Configuration
description: Own, validate, generate, and deploy environment values with Varlock.
sidebar:
  order: 4
---

init uses Varlock as its environment contract and loading system. An application owns
its complete contract in `.env.schema`; a reusable package owns only the fragments its
consumers may select under `env/`.

## Ownership and files

Package fragments use these names only when needed:

- `.env.shared`: non-sensitive values used across runtimes
- `.env.client`: values explicitly allowed in browser or native bundles
- `.env.server`: server-runtime values, including secrets
- `.env.build`: build, upload, and deployment-tool values that must not enter a client
  bundle

A package root schema composes its fragments for package-local commands. An application
schema imports the fragments for its selected packages and declares application-owned
keys. Do not add a central preset or import a package contract into an app that does not
consume it.

`.env.schema` owns key names, types, requirements, sensitivity, descriptions, and safe
defaults. `.env.development` is committed only when its values are safe for every clone.
Use an ignored `.env.local` for personal overrides. CI, preview, and production values
come from their deployment environment or an explicitly configured secret store.

## Change a key

Add or change the key in its owning schema or package fragment and use Varlock
decorators to describe it:

```dotenv
# Public API origin used by the browser bundle.
# @public @static @required @type=url
PUBLIC_API_URL=

# Server credential. Sensitive is the default in server contracts.
# @sensitive @required @type=string(minLength=32)
API_SECRET=

# Optional feature flag with a safe default.
# @public @type=boolean
FEATURE_ENABLED=false
```

`@public` is an explicit bundling decision; the spelling of a prefix is not a security
boundary. Use `@dynamic` for values read at runtime and `@static` for values embedded at
build time. Use `@optional`, `@required`, defaults, and type constraints to preserve the
actual runtime contract.

After adding, renaming, deprecating, or removing a key, update safe development values,
regenerate types, and validate:

```sh
bun run codegen
bun run env:check
bun run check
```

Varlock writes `env.generated.ts`. Callers import the generated binding directly and
keep the literal uppercase `ENV.<KEY>` identifier, which Varlock's Vite and Expo
integrations require for static replacement in client bundles:

```ts
import { ENV } from "#shared/env.generated.ts"
```

Do not read project configuration from `process.env` or `import.meta.env` in
application code, and do not alias the generated binding to lowercase `env`. Do not
edit the generated file by hand.

## Environment selection

`VARLOCK_ENV` selects development, test, preview, or production. Local commands use
safe `.env.development` values and `.env.local` overrides. CI and deployment commands
must set their target explicitly and run `varlock load` or the workspace's wrapped
command before building or mutating a remote environment. Bun's automatic dotenv
loader is disabled to prevent conflicting precedence rules.

Required production credentials are intentionally absent from committed development
files when no safe substitute exists. Every Varlock workspace owns an `env:check`
script that runs `varlock load`; the root `bun run env:check` fans those scripts out in
parallel through Turbo. Turbo passes deployment variables through without caching the
validation result.

## Framework boundaries

- TanStack Start and desktop Vite place the Varlock Vite plugin first. Their config
  files may read launcher-supplied `PORT` and `TAURI_*` values before plugins execute;
  application modules still use the typed `ENV` binding.
- Astro sites place the Varlock integration first.
- WXT installs the Varlock Vite plugin through its Vite configuration seam.
- Expo composes the Babel and Metro integrations outside Sentry and Uniwind. Expo's
  pre-bundle `app.config.js` is the only compatibility location that reads
  `process.env`; its commands run through Varlock.
- Tauri-supplied `TAURI_*` values are optional dynamic build inputs declared by the
  desktop schema.

Run `bun run env:scan` to build each client artifact and scan it for every sensitive
value in that workspace's committed development contract. Scans use explicit schema
and development-fixture paths so ignored local overrides cannot change CI results.
Each workspace verifies that its expected artifact directory exists before scanning,
so missing builds fail rather than silently passing.

## Deployment secrets

Plain secrets configured in the hosting, worker, or EAS platform are the supported
default. Set the target environment explicitly, validate before deploy, and never echo
resolved values. Development, preview, and production must use separate credentials;
preview must not inherit production secrets implicitly.

1Password is the reference optional secret store. A scaffold owner may install
Varlock's 1Password plugin and use schema references shaped like this, substituting
their own identifiers:

```dotenv
# @sensitive @required
SERVICE_TOKEN=op://<environment-vault>/<application-item>/credential
```

For local work, sign in with the 1Password desktop application or CLI and confirm
access with an agent-safe `varlock load` before starting the app. For CI, use a scoped
1Password service account token supplied by the CI platform as the secret zero; never
commit it or place it in a generated dotenv file. Give each environment a separate
vault or item and the narrowest read access.

When rotating a credential, update the target store, validate a non-mutating command,
deploy, then revoke the old value. On access denial, confirm account, vault, item, and
environment selection before changing schema references. Logs, summaries, snapshots,
generated files, and build artifacts must remain redacted; use agent-safe output and
the workspace artifact scans to verify this.

## Convex

Convex backend values do not pass through Varlock. Declare required keys in
`packages/backend/src/functions/convex.config.ts`, read the generated native `env` API,
and parse arrays or other structured strings at the backend boundary. Configure values
with the Convex dashboard or CLI for each deployment and authenticate CI with a scoped
Convex deploy key.

Do not synchronize Varlock-resolved values into Convex. Expo and other clients own
their non-sensitive Convex deployment and site URLs in their application schema. A
local Convex command may generate ignored `.env.local` client URLs; those values remain
local data rather than a second contract.

## Template commands

`bun run generate connect-backend` adds only the schema keys and development values
needed by the selected connection. Its edits are exact-key and idempotent, so removing
a backend-specific key does not remove a similarly named application key. Run codegen
after changing workspace selection so deleted packages cannot leave dangling imports.
