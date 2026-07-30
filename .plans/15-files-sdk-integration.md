# Plan 15 — Files SDK server and React client generators

**Status:** Pending
**Size:** M
**Depends on:** 07

Add snapshot-matched `files-sdk` template recipes after Plan 07 establishes the local
copy-once recipe catalog. Storage remains an application integration, not a shared
storage workspace or thin S3-helper package.

This plan generates both sides of the integration:

- **`files-sdk`** — a complete, authenticated Files SDK gateway in `apps/api`, based on
  the official [Hono server integration](https://files-sdk.dev/docs/ui/server/hono).
- **`files-client`** — a per-app React client based on the official
  [React integration](https://files-sdk.dev/docs/ui/client/react).

The recipes follow the generator conventions from Plans 07 and 14: plain Plop actions,
preflight before writes, `skipIfExists` idempotency, exact dependency versions, scoped
formatting, and explicit skip reporting.

## Generator structure

```text
turbo/generators/
  recipes/
    files/
      files-sdk.ts
      files-client.ts
  templates/
    files/
      files-sdk/
      files-client/
```

Expose both recipes through the local catalog:

```sh
bun run generate template --args files-sdk
bun run generate template --args files-client
```

## 1. `files-sdk` server recipe

### Files composition

Generate `apps/api/src/shared/files.ts` as the server-only composition root. It owns:

- the selected provider adapter;
- the configured `Files` instance;
- bucket and prefix configuration;
- conservative plugins and hooks;
- provider-specific environment configuration.

Install `files-sdk` with `bun add --exact` and only the selected adapter's optional peer
dependencies. Default to `files-sdk/bun-s3` for the lightweight Bun template and local
MinIO. Document `files-sdk/s3` as the richer S3 option for provider metadata, cache
control, delimiter listing, server-side copy, durable multipart uploads, and stronger
signed-upload policies. Do not use runtime provider loading unless a generated project
genuinely selects providers at runtime.

Keep a conservative default plugin policy: content-type handling, validation, and
signed-URL policy. Compression, encryption, deduplication, versioning, usage accounting,
soft deletion, failover, and tiering remain opt-in because they change semantics,
persistence, or cost.

### Complete Hono file router

Generate `apps/api/src/routes/v1/files.ts`. It creates the SDK gateway with
`createFilesRouter` from `files-sdk/api`, adapts it with `createRouteHandler` from
`files-sdk/hono`, and exports a Hono route created with the repository's `factory`.

Mount the handler with `app.all("/")`. The Files SDK handler dispatches all supported
traffic internally:

- `GET` serves downloads;
- `POST` serves the JSON operations;
- `PUT` serves the upload byte path.

Update `apps/api/src/routes/v1/index.ts` to mount the generated route:

```ts
.route("/files", filesRoutes)
```

The resulting public gateway endpoint is:

```text
/v1/files
```

Do not create a parallel top-level `/files` or `/api/files` route. Do not hand-build
individual upload, download, list, copy, move, delete, URL, or capability handlers; the
generated route exposes the complete `createFilesRouter` contract through the official
Hono adapter.

### Authentication and gateway policy

The gateway remains deny-by-default. Configure `authorize` on `createFilesRouter` to:

- resolve the existing Init session from the raw request headers;
- throw `FilesError("Unauthorized", ...)` when no valid session exists;
- return a per-user `keyPrefix`, so every key, bulk key, and both sides of copy/move are
  scoped server-side;
- constrain expiry and download disposition where appropriate;
- reject any operation the template does not intend to expose.

Configure the gateway's built-in safeguards rather than duplicating them in ad hoc Hono
handlers:

- `allowedOrigins` must align with the API's validated origins;
- `maxUploadSize`, `maxListLimit`, and `maxSearchResults` must have conservative values;
- downloads keep the safe attachment disposition unless inline rendering is explicitly
  authorized;
- `FILES_API_SECRET` is required and passed as the stable HMAC secret for the upload
  round trip. Never rely on the per-process random fallback.

The generated flow must preserve the gateway's direct-upload protocol: authorize and
bind the key/type/size during presign, upload directly when the provider supports it,
then complete and verify the stored object before returning success.

### Provider and environment rules

The recipe prompts for one maintained provider adapter. It may use explicit internal
variants such as `files-sdk-bun-s3`, `files-sdk-s3`, and `files-sdk-r2` when that keeps
each implementation simpler. Only the selected adapter's dependencies and environment
schema are generated.

Environment configuration is part of the generated result. Add `FILES_API_SECRET` and
the selected adapter's provider variables to `apps/api/src/shared/env.ts`, and append
them to `apps/api/.env.template` during the same run. Do not leave manual wiring TODOs.

Document capability differences instead of promising false portability. Use
`files.capabilities` where available and keep provider-specific access inside
`apps/api/src/shared/files.ts`.

Do not recreate `@init/storage`, add a shared storage workspace, or mirror all upstream
providers into a database enum. Provider, bucket, and MIME values remain text when an
application persists them.

## 2. `files-client` React recipe

The client recipe requires the server recipe's `/v1/files` contract to be present before
writing. It prompts for a maintained React client workspace and generates a small
app-local integration around `useFiles` from `files-sdk/react`.

Initial support covers React web clients that already have a supported authenticated
connection to `apps/api`. Preflight must reject unsupported targets with an exact remedy
instead of generating a client that the authenticated server will always reject.
React Native/Expo uses the SDK's separate React Native integration and remains future
work.

For each supported client, the recipe:

1. Installs `files-sdk` exactly in the selected app.
2. Generates an app-local module at `src/shared/files.ts`.
3. Configures the endpoint as `/v1/files` through the app's existing API URL helper,
   rather than hard-coding a deployment URL.
4. Supplies session credentials on every request using the app's existing authentication
   transport. Cross-origin clients must authenticate JSON requests and upload transport;
   generating only a `fetch` wrapper while leaving XHR/direct uploads unauthenticated is
   not acceptable.
5. Exposes a typed app-local hook for the full client verb set, including upload
   progress, ambient errors, cancellation, reactive reads, and capability checks.
6. Keeps all server-only provider imports and credentials out of the client workspace.

The generated client is infrastructure, not a demo file browser. Do not generate feature
UI, storage-provider choices, or application-specific ownership records. Documentation
should include concise examples of keyless upload, explicit-key upload, download versus
URL usage, progress, error handling, and reactive `useList`/`useFile`/`useSearch`.

## Coordination and preflight

- **`files-sdk` requires `apps/api`.** Preflight with `ensureWorkspaceExists` and report
  the exact `bun template add app api` remedy before writing.
- **`files-client` requires the generated server contract.** Verify the `/v1/files`
  mount and `apps/api/src/shared/files.ts` before changing a client workspace.
- **Client authentication is mandatory.** Reject a target without a supported way to
  send the existing Init session across every Files SDK transport.
- A Convex files backend adapter is separate future work because its mount point differs
  too much to parameterize.
- React Native/Expo client support is separate future work and should follow the SDK's
  dedicated React Native integration.

## Verification

Server recipe:

- Generate the default provider in a disposable scaffold and run `bun run check`.
- Assert the generated endpoint is exactly `/v1/files` and accepts the gateway's `GET`,
  `POST`, and `PUT` traffic.
- Exercise the full router against local MinIO from `infra/local/docker-compose.yml`.
- Verify unauthenticated access is denied.
- Verify an authenticated user cannot address keys outside their returned prefix,
  including bulk, copy, and move operations.
- Verify keyless direct upload performs presign, upload, and completion verification.
- Verify origin, upload-size, list-size, and expiry limits.
- Assert there is no `@init/storage` workspace or import.
- Assert server-only provider modules are absent from client builds.

Client recipe:

- Generate the React client into every supported target in a disposable scaffold.
- Exercise upload, progress, download, URL, list, capability, error, and cancellation
  behavior against the generated `/v1/files` gateway.
- Verify credentials are sent for JSON calls, proxied uploads, and direct-upload
  authorization/completion.
- Verify an unsupported target fails during preflight without partial writes.

Both recipes:

- Rerun each recipe and verify it reports a no-op.
- Verify missing requirements fail during preflight without partial writes.
- Run the standard repository verification commands:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

## Acceptance criteria

- `bun run generate template --args files-sdk` creates a typechecking authenticated
  Files SDK gateway in `apps/api`.
- The generated Files instance lives at `apps/api/src/shared/files.ts`.
- The generated Hono route lives at `apps/api/src/routes/v1/files.ts` and is mounted at
  `/v1/files` through `apps/api/src/routes/v1/index.ts`.
- The route uses the official `createFilesRouter` and Hono `createRouteHandler` contract
  to expose the complete gateway rather than hand-written per-operation handlers.
- Only the selected provider's dependencies and validated environment variables are
  added.
- The route denies access by default and scopes all file operations to the authenticated
  user.
- The gateway uses a validated stable secret and enforces origin, size, result, expiry,
  and disposition policy.
- `bun run generate template --args files-client` creates a typechecking React client
  connected to `/v1/files` in a supported app.
- The client supports the full documented React API and authenticates every request path
  without importing server-only code.
- Rerunning either recipe is a reported no-op.
- Missing or unsupported requirements fail during preflight without partial writes.

## Out of scope

- Generated file-browser or upload UI.
- React Native/Expo client integration.
- A Convex files backend adapter.
- Deploying storage services or creating external credentials.
- Mirroring every upstream provider or plugin.
- Runtime provider selection without a demonstrated project requirement.
