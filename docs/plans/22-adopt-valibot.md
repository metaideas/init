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
3. Add tests for parsing Files SDK results and rejecting invalid user identifiers at
   the API boundary.
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

1. Install `valibot` and `@valibot/to-json-schema` in the workspaces that own the
   shared validator and OpenAPI generation.
2. Convert the `/hello` query and response schemas to Valibot without changing
   `validator()` or `resolver()`.
3. Generate the OpenAPI document and compare it with the baseline.
4. Convert one TanStack Form field and one TanStack Router search schema.
5. Verify field errors, route search inference, server validation, and production
   builds.
6. Inspect the resulting browser chunk. Confirm that Valibot tree shaking works
   through the `@init/utils/schema` re-export before committing to that boundary.

Stop and redesign the shared import if the barrel prevents useful tree shaking. In
that case, import Valibot directly in client application workspaces and keep only the
custom reusable schemas in `@init/utils/schema`.

## 3. Change the shared schema package

After the vertical slice passes:

1. Replace the `zod` dependency in `packages/utils` with `valibot`.
2. Remove `zod-form-data`. The repository does not use its exported helpers.
3. Rewrite `packages/utils/src/schema.ts` with Valibot schemas and actions.
4. Export Valibot's API from `@init/utils/schema`.
5. Preserve the inferred output of `branded()` so Drizzle identifiers keep their
   nominal distinction.
6. Use `InferInput` and `InferOutput` explicitly where input and parsed output can
   differ. Do not replace every `z.infer` mechanically with one inference type.

Test URL host restrictions, IPv4 and IPv6 behavior, optional fields, unknown object
keys, and branded string inference. Zod and Valibot can have different default object
and issue behavior, so the tests must settle each intended rule.

## 4. Migrate project-owned schemas by workspace

Migrate in verifiable groups. Run the affected workspace tests and build after each
group.

### Application workspace

Convert the schemas in `apps/app`:

- Authentication schemas and form refinements.
- Theme cookie validation.
- Server function inputs.
- Reset-password search parameters.

Replace chained Zod methods with Valibot composition. Preserve the existing error
messages and the `confirmPassword` error path.

### API workspace

Convert the schemas in `apps/api`:

- Hono route input and response schemas.
- tRPC procedure inputs.
- Files SDK result parsing and branded user IDs.

Replace `schema.parse(input)` and `schema.safeParse(input)` with Valibot's functional
parse APIs. Keep validation at the existing trust boundaries.

Replace the tRPC `zodError` response field with a validator-neutral
`validationError` value. Define one stable response shape with message and path data.
Search all clients before deleting `zodError`. If a scaffolded project could depend
on it, document this as a Template breaking change.

### Package workspaces

Convert:

- Stripe result validation in `packages/payments`.
- Inngest event schemas in `packages/workflows`.
- Branded database identifier inference in `packages/db`.

Inngest accepts Standard Schema directly, so its surrounding API must not change.

## 5. Replace Drizzle's Zod integration

Do not combine this migration with an unnecessary Drizzle major upgrade.

1. Confirm which Valibot schema generator supports the repository's pinned
   `drizzle-orm` version.
2. Prefer `drizzle-orm/valibot` when the pinned version exports it. Otherwise use the
   matching `drizzle-valibot` package.
3. Replace `drizzle-zod` and remove the Zod schema factory configuration.
4. Verify select, insert, and update schema inference.
5. Verify branded ID columns, nullable columns, defaulted columns, timestamps, enums,
   and JSON columns.
6. Run dependency analysis and the monorepo consistency check after the package
   change.

Do not upgrade Drizzle only to use a different import path. Record a later migration
if the consolidated integration requires Drizzle 1.

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

The landing-page `shipTargetsSchema` is project-owned and can move to Valibot. Only
content collection schemas and other released Astro APIs that require Zod remain on
Zod.

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
bun run build --filter=api
bun run build --filter=web
bun run build --filter=@init/db
bun run build --filter=@init/payments
bun run build --filter=@init/workflows
bun --bun turbo generate
```

Use the actual workspace filters from the root Turborepo configuration if these
display names differ. For API code without a build script, run its type check and a
production start smoke test through its package scripts.

Manually verify:

- Authentication forms show the same messages on the same fields.
- Reset-password search parsing accepts and rejects the same values.
- Hono rejects invalid input and its generated OpenAPI document is unchanged where
  validation semantics are unchanged.
- tRPC returns the documented neutral validation error shape.
- Files SDK provider data does not cross the gateway without validation.
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
