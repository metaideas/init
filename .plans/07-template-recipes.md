# Plan 07 — Local template recipes

**Status:** Pending
**Size:** M
**Depends on:** 13, 14

Build snapshot-matched Turbo generator recipes so the template ships a lean runtime core
while optional, copy-once code remains one local command away. Plan 14 establishes the
generator conventions (plain Plop generators, shared helpers, `skipIfExists` idempotency,
`bun add --exact` versioning); this plan expands that machinery into the copy-once recipe
catalog.

## Model (decided)

- **Packages stay packages:** units with their own third-party dependencies and lifecycle
  (payments, AI, analytics, KV, email, ...) remain selectable workspaces through
  `bun template setup` / `bun template add`.
- **Template recipes are copy-once leaves:** utilities, optional wiring, and integration
  snippets become user-owned project code after generation. They create no runtime
  dependency on Init.
- Recipes MAY target files inside existing workspaces and MAY add dependencies,
  environment validation, or narrowly scoped integration wiring.
- **Backend connection wiring belongs to Plan 14.** The `connect-backend` generator owns
  all app↔backend transport and auth-client wiring (Convex, Hono, tRPC, and their auth
  variants). This plan owns the remaining copy-once catalog.
- **Distribution is local and snapshot-matched:** recipe definitions and source templates
  ship under `turbo/generators/` in every scaffold. They are renamed with the rest of the
  project during setup and therefore match the scaffold's recorded template commit.
- There is no hosted registry, shadcn schema, remote installer, or independent recipe
  release channel. New or corrected recipes reach an existing project through the same
  agent-assisted upstream diff workflow as other template improvements.
- Generators never modify existing user-owned consumers. Recipes add files, append to
  `.env.template`, make structural `package.json` changes, and perform at most narrow
  anchored line merges (env `extends`/schema, preset appends). Anything requiring
  broader mutation is out of scope.
- **Add-only rule (from Plan 14):** recipes may only `add` files that do not exist in
  the default scaffold; behavior changes to default-scaffold files must go through
  shipped seams. The sanctioned exceptions are purely additive merges: anchored env
  merges, `.env.template` appends, `presets.ts` export appends, and `shared/utils.ts`
  export appends. Skipped targets are always reported in generator output — never
  silently omitted.

## 1. Generator module and categorized template structure

Follow the Plan 14 conventions: plain Plop generators registered in `config.ts`, shared
helpers in `shared/utils.ts`, no installer framework or catalog module. The generator
list itself is the catalog.

```text
turbo/generators/
  config.ts
  shared/
    utils.ts
  recipes/
    utilities/
      codec.ts
      assert.ts
    scaffolds/
      new-feature.ts
      new-package.ts
    backend-clients/        # owned by Plan 14
      convex.ts
      hono.ts
      trpc.ts
    env/
      openai.ts
      anthropic.ts
      s3.ts
    payments/
      stripe-agent-toolkit.ts
    files/
      files-sdk.ts
      files-client.ts       # deferred; see §3
  templates/
    utilities/
      codec/
      assert/
    scaffolds/
      new-feature/
      new-package/
    backend-clients/        # owned by Plan 14
    env/
    payments/
      stripe-agent-toolkit/
    files/
      files-sdk/
```

- `config.ts` is the sole executable generator entrypoint. Public generators:
  `template` (this plan's copy-once catalog, grouped by category), `connect-backend`
  (Plan 14), `new-feature`, and `new-package`.
- Recipe modules export typed Plop generator definitions; `config.ts` imports and
  registers them. Composition may be reorganized only if it stays typesafe without
  significant type wrangling.
- Mirror the category between `recipes/` and `templates/`. Do not duplicate generated
  code in docs or a second distribution directory.
- Every plan that removes restorable code must add its canonical target, dependency/env
  requirements, and concrete source snippet here before deleting it. The generated
  recipe must compile.

Recipe targets use template-relative paths such as `packages/utils/src/codec.ts`.
Canonical sources use `@init/*`; `bun template setup` rewrites them with the rest of the
scaffold, and generators discover current workspace package names via `readPackageName`
rather than assuming a scope.

## 2. Template recipe backlog

- `codec` — Zod JSON codec (was `packages/utils/src/codec.ts`)
- `assert` — assertion helpers importing `@init/core/errors` (was
  `packages/utils/src/assert.ts`)
- `stripe-agent-toolkit` — (was `packages/payments/src/helpers.ts` `createAgentToolkit`)
- `files-sdk` — storage integration for `apps/api` replacing `packages/storage/`; see §3
- `files-client` — per-app client for the `files-sdk` backend; deferred until this
  plan's core lands; see §3
- env presets not available upstream in `@t3-oss/env-core/presets-zod`: `openai`,
  `anthropic`, `s3`
- ~~`railway`~~ — **dropped**: available upstream in `@t3-oss/env-core/presets-zod`;
  users import it directly
- ~~`email-organization-invitation`~~ — **dropped**: simple email template, not worth a
  recipe
- ~~`app-api-client` / `app-api-auth` / `app-api-trpc` / `app-api` /
  `desktop-api-client` / `mobile-auth-client-api` / `mobile-auth-client-convex`~~ —
  **moved to Plan 14**: all backend connection and auth-client wiring is owned by
  `connect-backend`. Their canonical snippets now live in Plan 14.
- ~~`@init/ui` unused components~~ — **decided: NOT template recipes.** All 57
  components stay in the template: they are customized to fit the project (base-ui port,
  project theming), and the user model is "import what you need, delete the rest."

### Utility recipe requirements

`codec` targets `packages/utils/src/codec.ts`:

```ts
import * as z from "#schema.ts"

export const jsonCodec = <T extends z.core.$ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString) as z.input<T>
      } catch (error) {
        ctx.issues.push({
          code: "invalid_format",
          format: "json",
          input: jsonString,
          message: error instanceof Error ? error.message : "Unknown error",
        })
        return z.NEVER
      }
    },
    encode: (value) => JSON.stringify(value),
  })
```

`assert` targets `packages/utils/src/assert.ts`:

```ts
import { AssertConditionFailedError, AssertUnreachableError } from "@init/core/errors"

/**
 * Asserts that a value is never, and throws an error if it is. Use this to make sure that all cases
 * in a `switch` statement are handled.
 */
export function assertUnreachable(x: never): never {
  throw new AssertUnreachableError({ value: String(x) })
}

/**
 * Throws an error if a condition is not met.
 */
export function throwUnless(condition: boolean, message: string): asserts condition is true {
  if (!condition) {
    throw new AssertConditionFailedError({ condition: "throwUnless" }).withMessage(message)
  }
}

/**
 * Throws an error if a condition is met.
 */
export function throwIf(condition: boolean, message: string): asserts condition is false {
  if (condition) {
    throw new AssertConditionFailedError({ condition: "throwIf" }).withMessage(message)
  }
}
```

### Payments recipe requirements

`stripe-agent-toolkit` targets `packages/payments/src/agent-toolkit.ts`, requires the
selected `@init/payments` workspace, installs `@stripe/agent-toolkit` with
`bun add --exact`, and exports:

```ts
import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk"
import { stripe as env } from "@init/env/presets"

export function createAgentToolkit() {
  return new StripeAgentToolkit({
    configuration: {
      actions: {
        paymentLinks: { create: true },
        prices: { create: true },
        products: { create: true },
      },
    },
    secretKey: env().STRIPE_SECRET_KEY,
  })
}
```

### Env preset recipe requirements

Each env recipe **appends** its named export to `packages/env/src/presets.ts` using a
Plop `append` action, skipped when the export name is already present. If a user
somehow extends the same preset twice, they fix it manually. Canonical snippets:

```ts
// openai
export const openai = () =>
  createEnv({
    runtimeEnv: env,
    server: {
      OPENAI_API_KEY: z.string(),
    },
    skipValidation: isCI,
  })

// anthropic
export const anthropic = () =>
  createEnv({
    runtimeEnv: env,
    server: {
      ANTHROPIC_API_KEY: z.string(),
    },
    skipValidation: isCI,
  })

// s3
export const s3 = () =>
  createEnv({
    runtimeEnv: env,
    server: {
      S3_ACCESS_KEY_ID: z.string(),
      S3_BUCKET: z.string().optional(),
      S3_ENDPOINT: z.string().optional(),
      S3_REGION: z.string().optional(),
      S3_SECRET_ACCESS_KEY: z.string(),
    },
    skipValidation: isCI,
  })
```

## 3. `files-sdk` recipe requirements

The storage integration splits in two:

- **`files-sdk`** — the API-side integration, part of this plan.
- **`files-client`** — a per-app client recipe (supporting all apps, like the old
  `hono-client`/`trpc-client` pattern), **deferred until the rest of this plan is
  finished**.

`files-sdk` treats storage as an application integration for `apps/api`, not a thin
S3-helper port:

1. Install `files-sdk` with `bun add --exact` and only the chosen adapter's optional
   peer dependencies. Default to `files-sdk/bun-s3` for the lightweight Bun template;
   document `files-sdk/s3` as the richer S3 option for provider metadata, cache control,
   delimiter listing, server-side copy, durable multipart uploads, and stronger
   signed-upload policies. Do not use runtime provider loading unless a generated
   project genuinely selects providers at runtime.
2. Put the provider adapter, `Files` instance, bucket configuration, and plugin
   composition in `apps/api/src/shared/files.ts`. Mount the `files-sdk/hono` backend
   integration in `apps/api/src/routes/files.ts`. There is no shared storage workspace
   or wrapper API.
3. Keep server and client imports separate so provider credentials and native SDKs
   cannot enter frontend bundles. Frontends use `files-sdk/client` or the relevant
   framework integration directly (via the future `files-client` recipe); server code
   uses provider subpaths.
4. Make the backend deny-by-default. Integrate Init authentication, authorize operations
   plus bucket/key prefixes, validate file type and size before issuing upload
   authorization, and require a validated `FILES_API_SECRET`. Never rely on the SDK
   gateway's random per-process fallback, which is unsuitable across multiple instances.
5. Start with a conservative plugin policy: content-type handling, validation, and
   signed-URL policy. Keep compression, encryption, deduplication, versioning, usage
   accounting, soft deletion, failover, and tiering opt-in because they change
   semantics, persistence, or cost.
6. Keep `packages/db`'s `assets` table as the application source of truth for ownership,
   organization, lifecycle status, expiry, and application metadata. Provider object
   metadata is not authoritative. Signed direct uploads transfer bytes outside
   `Files.upload()`, so the route must constrain authorization, verify the resulting
   object, and only then mark the asset available.
7. Document capability differences instead of promising false portability. In
   particular, `bun-s3` lacks custom metadata, cache control, delimiter results, and
   server-side copy; its copy passes bytes through the process and resumable uploads
   buffer in-process. Use `files.capabilities` where available and keep
   provider-specific access behind the API composition root.
8. Do not mirror all upstream providers into a database enum. Store provider, bucket,
   and MIME type as text; a generated project can impose its own allowlist if needed.

The recipe prompts for one maintained provider adapter. It may use explicit internal
variants (for example `files-sdk-bun-s3`, `files-sdk-s3`, and `files-sdk-r2`) when that
keeps each implementation simpler. Only the selected adapter's dependencies and
environment schema are generated.

Coordination notes:

- **The recipe requires `apps/api`.** Preflight via `ensureWorkspaceExists` reports the
  missing workspace and the exact `bun template add app api` remedy before writing. A
  `files-sdk-convex` recipe (the adapter exists) is separate future work because its
  mount point differs too much to parameterize.
- **Storage fields are deployment configuration.** Plan 02 leaves provider, bucket, and
  MIME type as plain text; the recipe's `files.ts` composition owns its bucket and
  prefix configuration.
- **Environment configuration is part of the generated result:** `FILES_API_SECRET` and
  the selected adapter's provider variables are added to validation and appended to env
  templates during the same run. The recipe must leave complete wiring rather than
  print a manual TODO.
- Verification is manual: scaffold, generate, run `bun run check`, and exercise the
  route against local MinIO (`infra/local/docker-compose.yml`) if desired. No CI
  contract suite.

## 4. Generator interface and installation workflow

Expose the copy-once catalog through the `template` generator:

```sh
bun run generate
bun run generate template --args codec
```

1. Interactive use presents the catalog grouped by category via the standard Turbo
   generator menu. `--args` provides the non-interactive path.
2. Preflight with `ensureWorkspaceExists` before any write; report the `bun template
add` remedy for missing workspaces and abort.
3. Apply using Plop primitives only:
   - `add`/`addMany` with `skipIfExists` for source files;
   - structural `package.json` updates via `addWorkspaceDependencies`;
   - `bun add --exact` for third-party dependencies;
   - `append` for `.env.template` values and `presets.ts` exports, with skip-functions
     that check for existing content;
   - install once after all package changes; format affected files with the managed
     formatter.
4. Reruns: existing targets are skipped, an already-installed recipe reports as a no-op.
   User-modified files are silently skipped; there is no drift detection or rollback.
5. Return a concise result listing created files, dependencies, and environment values
   the user must supply.

## 5. Recipe health (manual)

- Verify recipes manually in disposable scaffold copies after `bun template setup`:
  generated files use the renamed scope and the project passes `bun run check`.
- Test at least `codec`, one env preset, and the default `files-sdk` provider. The
  files-sdk check asserts there is no `@init/storage` workspace/import and that
  server-only provider modules are absent from client builds.
- Run recipes against the smallest supported workspace selection and verify missing
  requirements fail before any write.
- Include recipe sources and generator implementation in Adamantite/knip analysis while
  excluding inert `.hbs` source templates where appropriate.

No unit-test suite or CI harness for the generators; testing is local and manual.

## Acceptance criteria

- `bun run generate` lists the catalog recipes, and
  `bun run generate template --args codec` works non-interactively in a scaffolded
  project.
- Installing `codec` into a renamed project yields imports under the project scope, and
  `bun run check` passes.
- Installing an env preset recipe appends exactly one named export to
  `packages/env/src/presets.ts`; rerunning is a no-op.
- Installing a `files-sdk` provider variant produces a typechecking authenticated Hono
  route with only that provider's dependencies and validated env variables, appended to
  the env template in the same run.
- Every recipe sourced from removed template code has a canonical snippet in this plan
  (or in Plan 14 for backend wiring), and its generated files typecheck.
- Fresh scaffold runtime workspaces contain no copies of optional recipe output;
  canonical sources live only under `turbo/generators/templates/` until invoked.
- Missing workspaces fail during preflight without partial writes.
- Recipe installation is snapshot-local and makes no network request except dependency
  installation.

## Decisions (settled with maintainer)

- No installer framework, catalog module, snapshots, drift detection, or rollback —
  Plop primitives only, per Plan 14 conventions.
- Dependencies are installed at their latest versions with `bun add --exact`; version
  drift across packages is resolved by the user with `bun run fix:monorepo`.
- Recipes never modify existing user-owned consumers; additions are additive and easy
  to remove.
- All backend connection and auth-client wiring moved to Plan 14's `connect-backend`.
- `railway` and `email-organization-invitation` recipes dropped.
- Recipes ship with the scaffold and follow its template commit. There is no hosted
  catalog or updater.
- `@init/ui` components stay in the template in full.

## Out of scope

- Hosting or publishing recipe artifacts independently of the GitHub template.
- Updating previously scaffolded projects from a newer recipe catalog.
- Automatically adding a missing workspace or deploying an external service.
- Moving selectable, lifecycle-owning packages into copy-once recipes.
- Backend transport and auth-client adapters owned by Plan 14.
- The `files-client` recipe implementation (deferred until this plan's core lands).
- AST-based or syntax-aware file merging beyond anchored appends/modifies.
