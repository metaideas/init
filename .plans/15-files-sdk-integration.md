# Plan 15 — Files SDK API integration and React client generator

**Status:** Completed
**Size:** M
**Depends on:** 07

Add Files SDK as a built-in capability of `apps/api`, alongside its existing Hono and
tRPC routes. Only the React client remains an optional copy-once generator.

## Scope

- **Server:** directly implement the complete Files SDK Hono gateway in `apps/api`.
  It is part of the API workspace whenever that workspace is retained.
- **Client:** add a `files-client` generator based on the official
  [React integration](https://files-sdk.dev/docs/ui/client/react).

Storage remains an application integration, not a shared storage workspace or thin
S3-helper package.

## 1. Built-in API integration

Install `files-sdk` exactly in `apps/api`.

### Files composition

Create `apps/api/src/shared/files.ts` as the server-only composition root. It owns:

- the native `files-sdk/bun-s3` adapter;
- the configured `Files` instance;
- bucket configuration;
- upload type, size, and key policy;
- signed URL expiry and download-disposition policy.

The default adapter uses Bun's native S3 client and local MinIO, so it requires no
optional provider peer dependencies. Projects that need richer S3 behavior can replace
the composition with `files-sdk/s3` and install its peers.

Keep server and client imports separate so provider credentials and native SDKs cannot
enter frontend bundles.

### Complete Hono file router

Create `apps/api/src/routes/v1/files.ts` with `createFilesRouter` from `files-sdk/api`
and `createRouteHandler` from `files-sdk/hono`.

Mount the handler with `app.all("/")`. The Files SDK handler dispatches its complete
contract internally:

- `GET` serves downloads;
- `POST` serves JSON operations;
- `PUT` serves upload bytes.

Mount the route from `apps/api/src/routes/v1/index.ts`:

```ts
.route("/files", filesRoutes)
```

The public endpoint is `/v1/files`. Do not create parallel top-level `/files` or
`/api/files` routes, and do not hand-build per-operation handlers.

### Authentication and policy

Configure `authorize` to:

- resolve the existing Init session from raw request headers;
- throw `FilesError("Unauthorized", ...)` without a valid session;
- scope every key, bulk key, and both sides of copy/move under
  `users/<user-id>/`;
- force attachment disposition;
- constrain URL expiry and result counts.

Require a validated `FILES_API_SECRET` and pass it explicitly to the gateway. Configure
conservative upload, list, and search limits. Add `PUT` to the API's CORS methods.

Use the gateway's keyless upload protocol: presign or select the safe proxy path, upload,
then complete and verify the stored object. Content sniffing and validation may force
the proxy path when a direct provider upload would bypass server policy.

### Environment

Validate and document:

- `FILES_API_SECRET`;
- `S3_ACCESS_KEY_ID`;
- `S3_BUCKET`;
- `S3_ENDPOINT`;
- `S3_FORCE_PATH_STYLE`;
- `S3_REGION`;
- `S3_SECRET_ACCESS_KEY`.

The API env template points these variables at the existing local MinIO service and its
`assets` bucket.

## 2. `files-client` React generator

Register one public generator:

```sh
bun run generate files-client
bun run generate files-client --args app
```

The generator requires the built-in `/v1/files` API contract before writing. Initial
support covers `apps/app`, the maintained React web client with an authenticated Hono
connection. React Native and clients without supported auth transport fail preflight
without partial writes.

The generator:

1. Installs `files-sdk` exactly in the selected app.
2. Creates `src/shared/files.ts`.
3. Configures `/v1/files` through the existing API URL helper.
4. Sends the existing session credentials through JSON requests and gateway-bound XHR
   uploads without forwarding credentials to provider-signed URLs.
5. Preserves XHR upload progress.
6. Exposes an app-local `useFiles` hook plus `useFile`, `useList`, and `useSearch`.
7. Keeps every provider import and credential out of the client workspace.

The generator creates infrastructure, not feature UI. Documentation includes concise
upload, progress, download-versus-URL, error, cancellation, and reactive-read examples.

## Verification

- Type-check the built-in API integration.
- Assert `/v1/files` is mounted and unauthenticated operations are denied.
- Exercise the route against local MinIO.
- Generate `files-client` into a disposable scaffold and type-check the app.
- Verify JSON calls, explicit uploads, proxy uploads, and upload
  authorization/completion send the required credentials.
- Rerun the client generator and verify a reported no-op.
- Verify a missing API contract or unsupported target fails before any write.
- Assert server-only provider modules are absent from client builds.
- Run:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

## Acceptance criteria

- `apps/api/src/shared/files.ts` owns the built-in Files instance.
- `apps/api/src/routes/v1/files.ts` exposes the official complete Hono gateway.
- The route is mounted exactly at `/v1/files`.
- The gateway requires an authenticated session and scopes every operation to that user.
- Stable secret, origin, upload, result, expiry, type, key, and disposition policies are
  enforced.
- The checked-in API environment template works with local MinIO.
- `bun run generate files-client --args app` creates a type-checking authenticated React
  client for `/v1/files`.
- The client retains upload progress and never imports server-only modules.
- Rerunning the generator is a reported no-op.
- Missing or unsupported requirements fail during preflight without partial writes.

## Out of scope

- A server generator.
- Generated file-browser or upload UI.
- React Native/Expo client integration.
- A Convex files backend adapter.
- Other provider compositions in the base template.
- Deploying storage services or creating external credentials.
