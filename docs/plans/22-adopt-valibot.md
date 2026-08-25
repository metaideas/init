# Plan 22: Adopt Valibot for project-owned validation

**Status:** Proposed. Astro phase waits for supported Standard Schema APIs.
**Size:** M

Replace Zod with Valibot for validation that the Template owns. Keep Zod only where
Astro requires it. Do not create a validator-neutral schema wrapper.

Valibot implements Standard Schema. The current TanStack, Hono, tRPC, and Inngest
boundaries can consume Valibot schemas. Drizzle and Hono OpenAPI have Valibot
integrations. Astro is working on validator-neutral public APIs, but its released
content collection API still requires Zod.

## Decision

Keep `@init/utils/schema` as the shared import path and make it export Valibot. This
keeps one Template default and one place for reusable schemas such as HTTP URLs,
environment names, branded strings, and IP addresses. Callers will use Valibot's API
directly through that import path. The package is an ownership boundary, not an
attempt to hide which validation library the Template selects.

Use `v` as the namespace in callers:

```ts
import * as v from "@init/utils/schema"

const SearchSchema = v.object({
  name: v.optional(v.string()),
})

const result = v.safeParse(SearchSchema, input)
```

Keep Astro's Zod import explicit and local:

```ts
import { z } from "astro/zod"
```

Do not make `@init/utils/schema` imitate Zod's chained methods. Such a compatibility
layer would be a large public interface that hides little and makes future schema
features harder to use.

## 1. Establish behavior and bundle baselines

Before changing dependencies, record the current behavior that the migration must
preserve:

1. Add tests for `httpUrl()`, `env()`, `branded()`, and `ip()` in
   `packages/utils/src/__tests__/schema.test.ts`.
2. Add tests for authentication field messages and the password confirmation error
   path in `apps/app/src/features/auth/__tests__/validation.test.ts`.
3. Add tests for the existing Files SDK object-key validator. Preserve its accepted
   characters, path rules, and rejection of `.` and `..` segments.
4. Add a test for the public tRPC validation error response. Record its field paths
   and messages without treating the Zod class or issue codes as part of the new
   contract.
5. Generate the current Hono OpenAPI document and save assertions for the `/hello`
   query and response schemas.
6. Measure the browser chunks that contain the authentication and route schemas.
   Record compressed and uncompressed sizes. Do not claim a bundle improvement from
   package-level benchmarks.

These tests define compatibility. Preserve accepted inputs, parsed outputs, field
paths, and user-facing messages. Internal issue codes can change.

## 2. Prove the external integrations in one vertical slice

Create a short-lived migration branch for one representative path before changing the
shared export. Use the `/hello` Hono route and one authentication form schema.

1. Add `valibot` to `packages/utils`. Add a temporary
   `@init/utils/schema-valibot` entry point, which `apps/app` can use through its
   existing `@init/utils` dependency. Keep `@init/utils/schema` on Zod.
2. Add `@valibot/to-json-schema` to `apps/api` for OpenAPI generation. Do not add a
   direct Valibot dependency to `apps/app`.
3. Convert the `/hello` query and response schemas to Valibot without changing
   `validator()` or `resolver()`.
4. Generate the OpenAPI document and compare it with the baseline.
5. Convert one TanStack Form field and one TanStack Router search schema through the
   temporary entry point.
6. Verify field errors, route search inference, server validation, and production
   builds.
7. Inspect the resulting browser chunk. Confirm that Valibot tree shaking works
   through the temporary re-export before committing to that boundary.

Stop and redesign the shared import if the barrel prevents useful tree shaking. In
that case, import Valibot directly in client application workspaces and keep only the
custom reusable schemas in `@init/utils/schema`.

## 3. Add a parallel Valibot entry point

After the vertical slice passes:

1. Keep the temporary `@init/utils/schema-valibot` entry point for the migration.
2. Keep `@init/utils/schema`, `zod`, and `zod-form-data` unchanged while Zod callers
   remain.
3. Implement the shared Valibot schemas and actions in the temporary entry point.
4. Export Valibot's API from the temporary entry point.
5. Preserve the inferred output of `branded()` so Drizzle identifiers keep their
   nominal distinction.
6. Use `InferInput` and `InferOutput` explicitly where input and parsed output can
   differ. Do not replace every `z.infer` mechanically with one inference type.

Test URL host restrictions, IPv4 and IPv6 behavior, optional fields, unknown object
keys, and branded string inference. Zod and Valibot can have different default object
and issue behavior, so the tests must settle each intended rule.

The temporary entry point is a migration seam, not a permanent compatibility layer.
Each caller imports either the Zod entry point or the Valibot entry point. Do not mix
both libraries in one schema.

## 4. Migrate callers to the parallel entry point

Migrate callers in the following groups. Each group must pass its affected tests and
compiler check before the next group starts. The unchanged Zod entry point keeps the
remaining callers buildable.

### Application workspace

Convert the schemas in `apps/app`:

- Authentication schemas and form refinements.
- Theme cookie validation.
- Server function inputs.
- Reset-password search parameters.

Replace chained Zod methods with Valibot composition. Preserve the existing error
messages and the `confirmPassword` error path. Change these callers to import
`@init/utils/schema-valibot`.

### API workspace

Convert the schemas in `apps/api`:

- Hono route input and response schemas.
- tRPC procedure inputs.
- The Files SDK object-key validator.

Replace `schema.parse(input)` and `schema.safeParse(input)` with Valibot's functional
parse APIs. Keep validation at the existing trust boundaries. Change these callers
to import `@init/utils/schema-valibot`.

Replace the tRPC `zodError` response field with a validator-neutral
`validationError` value. Define one stable response shape with message and path data.
Search all clients before deleting `zodError`. If a scaffolded project could depend
on it, document this as a Template breaking change.

### Package workspaces

Convert:

- Inngest event schemas in `packages/workflows`.

Inngest accepts Standard Schema directly, so its surrounding API must not change.
`packages/payments` has no schema to migrate on `main`. Do not add payment validation
as part of this migration.

### Database package workspace

Do not combine this migration with an unnecessary Drizzle major upgrade.

1. Confirm which Valibot schema generator supports the repository's pinned
   `drizzle-orm` version.
2. Prefer `drizzle-orm/valibot` when the pinned version exports it. Otherwise use the
   matching `drizzle-valibot` package.
3. Convert branded database identifier inference to
   `@init/utils/schema-valibot`.
4. Replace `drizzle-zod` and remove the Zod schema factory configuration in the same
   verification unit.
5. Verify select, insert, and update schema inference.
6. Verify branded ID columns, nullable columns, defaulted columns, timestamps, enums,
   and JSON columns.
7. Run dependency analysis and the monorepo consistency check after the package
   change.

Do not upgrade Drizzle only to use a different import path. Record a later migration
if the consolidated integration requires Drizzle 1.

## 5. Promote Valibot to the shared entry point

After all project-owned callers use the temporary Valibot entry point:

1. Search tracked source and template recipes for callers of `@init/utils/schema`.
   Confirm that no Zod caller remains on that shared entry point. Track Astro's
   explicit `astro/zod` import separately.
2. Make `packages/utils/src/schema.ts` export the tested Valibot implementation.
3. Change all `@init/utils/schema-valibot` imports to `@init/utils/schema`.
4. Delete the temporary entry point in the same commit.
5. Remove the direct `zod` and `zod-form-data` dependencies from `packages/utils`.
   The repository does not use the form-data helpers.
6. Run the full repository checks before starting the template recipe migration.

This promotion is one atomic verification unit. The repository must not contain a
commit where `@init/utils/schema` exports Valibot while one of its callers still uses
a Zod-specific API.

## 6. Rewrite the optional JSON codec recipe

The `codec` template recipe uses Zod-specific codec types, parse context, issue
mutation, and `z.NEVER`.

1. Define the required caller behavior before selecting the Valibot implementation:
   decode a JSON string, validate the decoded value, and encode a valid output as a
   JSON string.
2. Preserve distinct input and output inference.
3. Return a normal Valibot issue for invalid JSON. Do not cast parsed JSON to the
   target type before validation.
4. Add generator snapshot or output tests for valid JSON, malformed JSON, a decoded
   value that fails the supplied schema, and encoding.
5. Update `turbo/generators/templates/code-snippets/codec.ts.hbs` and generate a real
   scaffolded output during verification.

If Valibot does not provide a clear bidirectional schema abstraction for this use,
generate a small `jsonCodec()` object with explicit `decode()` and `encode()` methods.
Do not reproduce Zod's internal codec API.

## 7. Keep the Astro exception isolated

Keep `apps/web/src/content.config.ts` on `astro/zod`. Do not pass Astro schemas through
`@init/utils/schema`, and do not add adapters that depend on Astro internals.

The landing-page animation uses an unchecked `JSON.parse` assertion on `main`. Do not
add a ship-target schema as part of this migration. Only content collection schemas
and other released Astro APIs that require Zod remain on Zod.

When Astro releases Standard Schema support:

1. Confirm that content collection type inference, `image()`, references, generated
   JSON Schema, and editor completion work with Valibot.
2. Convert `apps/web/src/content.config.ts`.
3. Run `astro sync` and compare generated collection types.
4. Build the web and documentation application workspaces.
5. Remove the final project-level Zod use. Do not try to remove Zod copies owned by
   transitive dependencies.

Treat this as a separate phase with its own release gate. The main migration can ship
while Astro keeps its isolated Zod use.

## 8. Clean up and document the decision

After all project-owned migrations pass:

1. Search tracked source and generator templates for `zod`, `Zod`, `z.`,
   `safeParse`, and method-style `.parse()` calls.
2. Classify remaining lockfile entries as transitive dependencies. Do not override or
   deduplicate them by hand.
3. Update comments and generator documentation that name Zod as the Template default.
4. Record the Template selection in `docs/template/adr/` because the validator is a
   Template governance choice.
5. Include the measured bundle result and the Astro exception in the decision record.

## Verification

Run the repository checks after each migration group:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

Also run targeted builds and generation:

```sh
bun run build --filter=app
bun run build --filter=web
bun x tsc --noEmit --project apps/api/tsconfig.json
bun x tsc --noEmit --project packages/db/tsconfig.json
bun x tsc --noEmit --project packages/payments/tsconfig.json
bun x tsc --noEmit --project packages/workflows/tsconfig.json
bun --bun turbo generate
```

The application commands run real builds. The package commands invoke the TypeScript
compiler directly because those workspaces do not define `build` scripts. Run an API
production-start smoke test after its compiler check when the required local services
and environment values are available.

Manually verify:

- Authentication forms show the same messages on the same fields.
- Reset-password search parsing accepts and rejects the same values.
- Hono rejects invalid input and its generated OpenAPI document is unchanged where
  validation semantics are unchanged.
- tRPC returns the documented neutral validation error shape.
- The Files SDK object-key validator preserves its current behavior.
- Inngest event payloads remain inferred and validated.
- Drizzle-generated schemas preserve database types and optionality.
- The generated JSON codec validates decoded values and reports malformed JSON.

## Completion criteria

The project-owned migration is complete when:

- `@init/utils/schema` exports Valibot and its custom schemas preserve tested
  behavior.
- Application and package workspaces use Valibot for project-owned validation.
- Hono validation and OpenAPI generation pass with Valibot.
- tRPC exposes no Zod-specific error contract.
- Drizzle schema generation uses its Valibot integration.
- Template recipes do not generate Zod code.
- Bundle measurements show the actual effect of the change.
- The only direct Zod source import is an explicit released-Astro requirement, or
  Astro support has shipped and that exception has also been removed.
- Formatting, linting, type checking, dependency analysis, tests, builds, and
  generator verification pass.

## Risks and open questions

- The shared re-export may reduce Valibot tree shaking. The vertical slice settles
  this before the broad rewrite.
- Zod and Valibot can differ in unknown-key handling and issue paths. Behavior tests
  settle the intended contract.
- The compatible Drizzle Valibot package depends on the pinned Drizzle version. Do
  not assume the current documentation's import path works without a compile test.
- The tRPC error field rename can affect external clients even though this repository
  has no current reader.
- Astro's proposal has no committed release date. Keep its phase independent.
