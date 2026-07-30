# Plan 15 — Files SDK integration

**Status:** Pending
**Size:** M
**Depends on:** 07

Add a snapshot-matched `files-sdk` template recipe after Plan 07 establishes the local
copy-once recipe catalog. Storage remains an application integration in `apps/api`, not
a shared storage workspace or thin S3-helper package.

## Scope

- **`files-sdk`** — API-side integration generated into `apps/api`.
- **`files-client`** — a per-app client recipe supporting maintained client apps,
  deferred until the API-side recipe has landed and its public contract is stable.

The recipe follows the generator conventions from Plans 07 and 14: plain Plop actions,
preflight before writes, `skipIfExists` idempotency, exact dependency versions, scoped
formatting, and explicit skip reporting.

## Generator structure

```text
turbo/generators/
  recipes/
    files/
      files-sdk.ts
  templates/
    files/
      files-sdk/
```

Expose the recipe through the local catalog:

```sh
bun run generate template --args files-sdk
```

## `files-sdk` recipe requirements

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
   framework integration directly through the future `files-client` recipe; server
   code uses provider subpaths.
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
variants such as `files-sdk-bun-s3`, `files-sdk-s3`, and `files-sdk-r2` when that keeps
each implementation simpler. Only the selected adapter's dependencies and environment
schema are generated.

## Coordination

- **The recipe requires `apps/api`.** Preflight with `ensureWorkspaceExists` and report
  the exact `bun template add app api` remedy before writing.
- A `files-sdk-convex` recipe is separate future work because its mount point differs
  too much to parameterize.
- **Storage fields are deployment configuration.** Plan 02 leaves provider, bucket, and
  MIME type as text; the generated `files.ts` composition owns its bucket and prefix
  configuration.
- **Environment configuration is part of the generated result.** Add
  `FILES_API_SECRET` and the selected adapter's provider variables to validation and
  append them to env templates during the same run. Do not leave manual wiring TODOs.

## Verification

- Generate the default provider in a disposable scaffold and run `bun run check`.
- Exercise the route against local MinIO from `infra/local/docker-compose.yml`.
- Assert there is no `@init/storage` workspace or import.
- Assert server-only provider modules are absent from client builds.
- Rerun the recipe and verify it reports a no-op.
- Verify a missing `apps/api` fails before any write.
- Run the standard repository verification commands:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

## Acceptance criteria

- `bun run generate template --args files-sdk` creates a typechecking authenticated Hono
  route and provider composition.
- Only the selected provider's dependencies and validated environment variables are
  added.
- Environment template values are appended during the same run.
- Server-only dependencies cannot enter frontend bundles.
- The route denies access by default and validates authorization, key prefixes, type,
  and size before issuing upload authorization.
- The application verifies direct uploads before marking assets available.
- Rerunning is a reported no-op.
- Missing requirements fail during preflight without partial writes.

## Out of scope

- The `files-client` recipe implementation, deferred until the API contract is stable.
- A Convex files backend adapter.
- Deploying storage services or creating external credentials.
- Mirroring every upstream provider or plugin.
- Runtime provider selection without a demonstrated project requirement.
