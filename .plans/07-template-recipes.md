# Plan 07 — Local template recipes

**Status:** Completed
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
  templates/
    utilities/
      codec/
      assert/
    scaffolds/
      new-feature/
      new-package/
    backend-clients/        # owned by Plan 14
    env/
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
  requirements, and concrete source snippet to the owning plan before deleting it. The
  generated recipe must compile.

Recipe targets use template-relative paths such as `packages/utils/src/codec.ts`.
Canonical sources use `@init/*`; `bun template setup` rewrites them with the rest of the
scaffold, and generators discover current workspace package names via `readPackageName`
rather than assuming a scope.

## 2. Template recipe backlog

- `codec` — Zod JSON codec (was `packages/utils/src/codec.ts`)
- `assert` — assertion helpers importing `@init/core/errors` (was
  `packages/utils/src/assert.ts`)
- ~~`stripe-agent-toolkit`~~ — **dropped**: too small to justify a dedicated recipe
- env presets not available upstream in `@t3-oss/env-core/presets-zod`: `openai`,
  `anthropic`, `s3`
- ~~`files-sdk` / `files-client`~~ — **moved to Plan 15** so storage integration can
  evolve independently after the core recipe catalog lands
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

## 3. Generator interface and installation workflow

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

## 4. Recipe health (manual)

- Verify recipes manually in disposable scaffold copies after `bun template setup`:
  generated files use the renamed scope and the project passes `bun run check`.
- Test at least `codec` and one env preset.
- Run recipes against the smallest supported workspace selection and verify missing
  requirements fail before any write.
- Include recipe sources and generator implementation in Adamantite/knip analysis while
  excluding inert `.hbs` source templates where appropriate.

No unit-test suite or CI harness for the generators; testing is local and manual.

## Acceptance criteria

- `bun run generate` lists the catalog recipes, and
  `bun run generate template --args codec` works non-interactively in a scaffolded
  project.
- Installing recipes into a renamed project yields workspace imports under the project
  scope, and `bun run check` passes.
- Installing an env preset recipe appends exactly one named export to
  `packages/env/src/presets.ts`; rerunning is a no-op.
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
- File storage integration moved to Plan 15.
- The Stripe Agent Toolkit helper was dropped because it does not warrant a recipe.
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
- File storage recipes owned by Plan 15.
- AST-based or syntax-aware file merging beyond anchored appends/modifies.
