# Plan 02 — Package consolidation & dead-code sweep

Consolidate micro-packages and remove dead code from `packages/`. Decisions below are final (agreed with the maintainer) unless marked "confirm first".

Anything removed that is still _useful as copy-once code_ must be recorded in `.plans/07-registry.md` under "Registry backlog" instead of being lost — append to that list as you delete.

## 1. Merge `@init/error` into `@init/core` as `@init/core/errors`

`packages/error` (85 LOC, faultier-based tagged errors) disappears; `packages/core` (currently a placeholder with literal `unused()` exports) becomes the home for domain primitives.

Steps:

1. Delete placeholder content: `packages/core/src/index.ts` `unused()`, `packages/core/src/features/` (`unusedFeature()`, `.gitkeep`), and the `"./features/**"` export in `packages/core/package.json`.
2. Move `packages/error/src/*` → `packages/core/src/errors/` (keep the domain split: `auth.ts`, `email.ts`, `utils.ts`, barrel `index.ts`). Add `faultier` to core's dependencies.
3. Core exports: `"."` and `"./errors"` only. Do NOT replicate error's `"./*"` wildcard — consumers used only the root barrel.
4. Update all consumers from `@init/error` → `@init/core/errors`:
   - `apps/app/src/shared/server/middleware.ts`
   - `apps/app/src/shared/server/serialization.ts`
   - `packages/email/src/client.ts`
   - `packages/backend/src/functions/models/documents.ts`
   - `packages/backend/src/functions/shared/convex.ts`
   - `packages/utils/src/assert.ts` — being deleted anyway (see §3)
   - package.json deps in: `apps/api` (declared but unused in src — just remove the dep), `apps/app`, `packages/email`, `packages/utils`, `packages/backend`
5. Delete `packages/error/`. Update `cli/src/workspaces.ts` (remove the `error` entry, add/keep `core`) and the knip config if it references error.

## 2. Delete `@init/storage`, decouple storage records from the implementation

`packages/storage` (51 LOC) has no runtime consumers. Only `packages/db/src/schema.ts:1-2` imports it — types only (`StorageBucket` from `buckets.ts`, `MimeType` from `helpers.ts`). Future storage support will use `files-sdk` directly from the API composition root and its client/backend integrations; it will not recreate an `@init/storage` wrapper.

Steps:

1. Remove the `StorageBucket` and `MimeType` imports and their `.$type<...>()` annotations from `packages/db/src/schema.ts`; keep `bucket` and `mimeType` as plain text columns. Do not move these implementation types into db or add `mime` there. Bucket names are deployment configuration, and MIME values can include parameters such as `text/plain; charset=utf-8` that the old static type excludes.
2. Replace the `storage_provider` PostgreSQL enum with a text `provider` column while preserving the `"s3"` default. A database migration is required. Do not encode `files-sdk`'s provider catalog as a database enum: generated projects should be able to add an adapter without altering a template-owned TypeScript type, while each project may add its own constraint if desired.
3. Remove `@init/storage` from `packages/db/package.json`. No replacement db dependency is needed.
4. Delete the unused runtime helpers rather than preserving their implementation: `files-sdk` replaces the S3 factory and provides content-type facilities; the current silent key sanitizer is not a sufficient authorization or key-policy boundary. Plan 07's registry backlog contains the replacement `files-sdk` integration recipe, not a copy of these helpers.
5. Delete `packages/storage/`. Remove the `s3` env preset from `packages/env/src/presets.ts` (its only purpose was this package); the future registry recipe adds only the selected provider's validated variables. Update `cli/src/workspaces.ts` and knip config.

## 3. Dead-code sweep

Delete, updating package.json deps/exports accordingly:

- `packages/utils/src/assert.ts` and `packages/utils/src/codec.ts` — zero importers. Add both to registry backlog.
- `unstorage` dependency in `packages/utils/package.json` — nothing imports it.
- `packages/env/src/presets.ts`: delete `railway`, `openai`, `anthropic` presets (no corresponding package/consumer). KEEP `convex` (serves `packages/backend`), `posthog` (serves `packages/analytics`), `stripe` (payments), `resend` (email). Delete `s3` per §2.
- `packages/observability`: delete `src/uptime.ts`, the `./uptime` export, and the `@openstatus/react` dependency.
- `packages/auth`: delete `src/integrations/expo/{client,server}.ts` (pure re-exports of `src/expo/*`; only `@init/auth/expo/client` is imported, by apps/mobile) and the corresponding export-map entries. Move `src/integrations/start.ts` (tanstack-start cookies, unused) to registry backlog and delete. Delete unused `createErrorHandler` in `src/client/index.ts`.
- `packages/ui`: remove the `./hooks/*` export from package.json (`use-mobile.ts` is internal to sidebar — keep the file). Fix `src/components/theme.tsx` importing from its own package name `@init/ui/...` — use `#` subpath imports like the rest of the package.
- `packages/db/src/helpers.ts`: delete unused `increment`/`decrement`; add to registry backlog.
- `packages/analytics`: KEEP the package (selectable unit), but dedupe the copy-pasted `useIdentifyUser` between `src/product/react.ts` and `src/product/expo.ts` (extract shared logic).
- `packages/email/src/client.ts`: dedupe the verbatim `MOCK_RESEND` preview logic between `sendEmail` and `batchEmails`.
- `packages/payments/src/helpers.ts`: delete `createAgentToolkit` (Stripe AI Agent Toolkit) and its deps; add to registry backlog (confirmed by maintainer). Keep the rest of payments.
- `packages/ai`: KEEP as-is (selectable unit, maintainer decision).

## 3b. Root-level dead infrastructure

- **Delete `scripts/`** (decided — leftover from previous tooling work): `scripts/index.ts` is an empty yargs shell, `scripts/helpers.ts` a 5-line identity helper. Remove the `"scripts"` entry from root `package.json` scripts, the `scripts/**` entries in `knip.config.ts`, and mentions in `AGENTS.md`/`docs/project-structure.md` (the "scripts" folder description).
- **Prune orphaned root devDependencies**: with `scripts/` gone and the CLI standalone, verify and remove unused root devDeps — `yargs`, `@types/yargs`, and check whether `effect`, `@effect/cli`, `@effect/platform`, `@effect/platform-bun`, `@octokit/rest` are used by anything at root (turbo generators, etc.); remove those that aren't (`bun run analyze` should confirm).
- `packages/kv`: refactor the `class` wrapper to a factory function, per the repo's own "avoid classes" style rule (behavior unchanged).

## 4. Keep `cli/src/workspaces.ts` consistent

Every package added/removed above must be reflected in `cli/src/workspaces.ts` and its test (`cli/src/__tests__/workspaces.test.ts`) so `init-now setup` doesn't offer deleted packages. (Plan 04 replaces this file with a generated manifest; here, just keep it truthful.)

## Acceptance criteria

- `packages/error` and `packages/storage` no longer exist; `rg "@init/error|@init/storage" --glob '!node_modules'` returns nothing.
- Db storage records use plain text for provider, bucket, and MIME type and have no dependency on `mime`, `files-sdk`, or provider-specific types.
- `@init/core` has real content (`errors/`) and no `unused()` placeholders.
- `bun run check`, `bun run analyze` (knip should report fewer issues, none new), `bun run check:monorepo`, `bun test`, and `cd cli && bun test` all pass.
- Registry backlog section in `.plans/07-registry.md` lists every useful deletion.
