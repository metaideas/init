# Authenticated Files gateway and asset index

## Status

Implemented; awaiting review.

## Objective

Exercise one complete authenticated file lifecycle through the API application:

1. an authenticated user uploads a file through Files SDK;
2. the object is written to the configured S3-compatible bucket;
3. a Files SDK `onAction` hook records the object's ownership and metadata in the
   `storage.assets` table;
4. another user cannot access the object; and
5. deleting the object removes the asset record.

Keep the Files SDK gateway at the versionless `/files` transport seam. Reserve
`/v1/assets` for a future application-owned HTTP interface over asset IDs, ownership,
organizations, metadata, and references.

## Acceptance criteria

- The Files SDK gateway is mounted at `/files`, not `/v1/files`.
- `apps/api/src/routes/files.ts` owns the Files SDK router and authorization policy.
- The existing Files SDK singleton in `apps/api/src/shared/files.ts` owns the inline
  asset-index hook.
- The `/v1` router contains only application-owned HTTP routes.
- Hono's existing `contextStorage()` and `requireSession` middleware provide the
  authenticated session, database, and logger to Files SDK callbacks.
- Shared `context()` and `AuthenticatedAppContext` definitions provide typed access to
  that request state outside ordinary Hono handlers.
- The route does not perform a second Better Auth session lookup inside `authorize`.
- Successful upload completion creates or updates one `storage.assets` row owned by
  the authenticated user.
- Successful deletion removes the matching asset row owned by the authenticated user.
- `onAction` dispatches successful events to local `handleUpload` and `handleDelete`
  functions in the singleton module; there is no persistence service or custom Files
  SDK plugin.
- Repeated upload-completion events are idempotent through the unique index on `key`.
- Database failures from the fire-and-forget hook are caught and logged without
  producing unhandled promise rejections.
- The template contains exactly one baseline database migration generated from the
  current schema.
- Formatting, static checks, dependency analysis, and relevant build verification
  pass.

## Decisions

### Treat `/files` as transport infrastructure

The Files SDK gateway's wire format is controlled by Files SDK. It is transport and
protocol plumbing, like Better Auth, tRPC, and Inngest, rather than an
application-owned REST resource.

Use this route split:

| Route        | Ownership                                  |
| ------------ | ------------------------------------------ |
| `/files`     | Files SDK transport gateway                |
| `/auth`      | Better Auth transport gateway              |
| `/trpc`      | tRPC transport gateway                     |
| `/workflows` | Inngest transport gateway                  |
| `/v1/assets` | Future application-owned asset interface   |
| `/v1/me`     | Application-owned authenticated HTTP route |

Do not add `/v1/assets` as part of this slice. Its route is reserved for later domain
behavior and should not proxy Files SDK operations.

### Use the database as an eventually consistent asset index

Object storage remains the source of truth for whether bytes exist. The assets table
tracks which authenticated user owns each stored object and provides a stable asset ID
for future references from other tables.

Files SDK's `onAction` hook is observational and fire-and-forget: Files SDK does not
await a promise returned by the hook, and a hook failure cannot fail the storage
operation. Therefore:

- the upload response does not guarantee that the asset row is already visible;
- every hook-owned promise must have an explicit rejection handler;
- stronger delivery guarantees or reconciliation are follow-up work, not hidden inside
  this first slice.

### Dispatch `onAction` events to local handlers

Keep the persistence behavior local to the Files singleton. Do not introduce an
`assetPersistence` plugin, repository wrapper, or callback adapter.

Use a switch to keep the hook concise. Single upload and head events call
`handleUpload`; delete events normalize their single or bulk keys and call
`handleDelete`. These handlers remain private functions in `shared/files.ts` and
execute the Drizzle operations directly.

### Use a Files-SDK-shaped asset record

The `storage.assets` table stores the stable asset ID, Files SDK metadata, and two
distinct user roles:

- `key`, `name`, `size`, `type`, `etag`, `lastModified`, and `metadata` mirror the
  stored file returned by Files SDK;
- `ownerId` records the user to whom the asset belongs; and
- `uploaderId` records the user who placed the asset in managed storage.

The current upload flow assigns the authenticated user to both roles. Keeping them
separate preserves creation provenance if ownership changes later. The configured
Files singleton owns one bucket, so the storage key is the unique object identity and
bucket/provider columns are unnecessary.

### Observe upload and head completion

Handle successful `upload` events and successful `head` events. Direct/proxied uploads
can produce an upload result, while completion of a direct or presigned upload can be
confirmed through a follow-up `head`. The unique `key` conflict target makes both paths
idempotent.

Do not support copy or move until their destination-ownership behavior is explicitly
defined. Do not build the index from list results.

## Implementation plan

### 1. Move the Files SDK gateway out of `/v1`

Move:

```text
apps/api/src/routes/v1/files.ts
```

to:

```text
apps/api/src/routes/files.ts
```

Add the route to `apps/api/src/routes/index.ts`:

```diff
+import filesRoutes from "#routes/files.ts"
 import healthRoutes from "#routes/health.ts"
 import trpcRoutes from "#routes/trpc.ts"
 import v1Routes from "#routes/v1/index.ts"
 import workflowRoutes from "#routes/workflows.ts"

 export const router = app
   // Keep the existing root and OpenAPI handlers.
   .route("/health", healthRoutes)
+  .route("/files", filesRoutes)
   .route("/workflows", workflowRoutes)
   .route("/trpc", trpcRoutes)
   .route("/v1", v1Routes)
```

Remove the transport route from `apps/api/src/routes/v1/index.ts`:

```diff
-import filesRoutes from "#routes/v1/files.ts"
 import { m } from "#shared/internationalization/messages.js"

 export default factory
   .createApp()
-  .route("/files", filesRoutes)
   .get(
     "/hello",
     // Keep the existing handler unchanged.
   )
   .get("/me", requireSession, (c) => c.json(c.var.session.user))
```

### 2. Add shared typed context access

Add the authenticated refinement to `apps/api/src/shared/types.ts`:

```ts
export type AuthenticatedAppContext = DeepMerge<AppContext, { Variables: { session: Session } }>
```

Restore the context-storage helper in `apps/api/src/shared/utils.ts`, allowing callers
to select a refined context while defaulting to `AppContext`:

```ts
export function context<T extends AppContext = AppContext>() {
  return getContext<T>()
}
```

Make `requireSession` consume the shared authenticated type instead of declaring the
same merge inline:

```ts
export const requireSession = createMiddleware<AuthenticatedAppContext>(async (c, next) => {
  // Keep the existing middleware implementation.
})
```

### 3. Add `onAction` directly to the Files singleton

Replace `apps/api/src/shared/files.ts` with this proposed implementation:

```ts
import { assets, type UserId } from "@init/db/schema"
import * as z from "@init/utils/schema"
import { helpers } from "@init/db/helpers"
import type { DeleteManyResult, StoredFile, UploadResult } from "files-sdk"
import { createFiles } from "files-sdk"
import { bunS3 } from "files-sdk/bun-s3"
import { contentType } from "files-sdk/content-type"
import { signedUrlPolicy } from "files-sdk/signed-url-policy"
import { validation } from "files-sdk/validation"
import env from "#shared/env.ts"
import type { AuthenticatedAppContext } from "#shared/types.ts"
import { context } from "#shared/utils.ts"

export const FILES_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const FILES_MAX_URL_AGE = 15 * 60

export const files = createFiles({
  adapter: bunS3({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    bucket: env.S3_BUCKET,
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    virtualHostedStyle: !env.S3_ENDPOINT,
  }),
  hooks: {
    onAction(event) {
      if (event.status !== "success") return

      switch (event.type) {
        case "upload":
          if (event.key) handleUpload(event.key, event.result as UploadResult)
          break
        case "head":
          if (event.key) handleUpload(event.key, event.result as StoredFile)
          break
        case "delete": {
          const keys = event.key ? [event.key] : (event.result as DeleteManyResult).deleted

          handleDelete(keys)
          break
        }
        default:
          break
      }
    },
  },
  plugins: [
    signedUrlPolicy({
      maxExpiresIn: FILES_MAX_URL_AGE,
      maxUploadSize: FILES_MAX_UPLOAD_SIZE,
    }),
    validation({
      allowedTypes: ["image/*", "application/pdf"],
      key: (key) =>
        z
          .string()
          .regex(/^[\w.-]+(?:\/[\w.-]+)*$/u)
          .refine((value) =>
            value.split("/").every((segment) => segment !== "." && segment !== "..")
          )
          .safeParse(key).success,
      maxSize: FILES_MAX_UPLOAD_SIZE,
      minSize: 1,
    }),
    contentType({ onMismatch: "reject" }),
  ],
})

function handleUpload(key: string, file: UploadResult | StoredFile) {
  const ctx = context<AuthenticatedAppContext>()
  const mimeType = "contentType" in file ? file.contentType : file.type
  const name = "name" in file ? file.name : (key.split("/").at(-1) ?? key)

  void ctx.var.db
    .insert(assets)
    .values({
      etag: file.etag,
      key,
      lastModified: file.lastModified,
      metadata: "metadata" in file ? file.metadata : undefined,
      name,
      ownerId: ctx.var.session.user.id as UserId,
      size: file.size,
      type: mimeType,
      uploaderId: ctx.var.session.user.id as UserId,
    })
    .onConflictDoUpdate({
      set: {
        etag: file.etag,
        lastModified: file.lastModified,
        metadata: "metadata" in file ? file.metadata : undefined,
        name,
        size: file.size,
        type: mimeType,
        updatedAt: new Date(),
      },
      target: assets.key,
    })
    .catch((error: unknown) => {
      ctx.var.logger.error(`Failed to record asset: ${String(error)}`)
    })
}

function handleDelete(keys: string[]) {
  if (keys.length === 0) return

  const ctx = context<AuthenticatedAppContext>()

  void ctx.var.db
    .delete(assets)
    .where(
      helpers.and(
        helpers.inArray(assets.key, keys),
        helpers.eq(assets.ownerId, ctx.var.session.user.id as UserId)
      )
    )
    .catch((error: unknown) => {
      ctx.var.logger.error(`Failed to delete asset records: ${String(error)}`)
    })
}
```

The singleton is still constructed once at module initialization. Only the `onAction`
callback reads Hono context, and it does so when Files SDK invokes the singleton during
an authenticated request.

This intentionally makes action-producing use of this singleton request-bound: a
future caller that invokes it outside Hono context would not have a session to assign
as `ownerId` and `uploaderId` and must use a separately configured Files instance or
establish an equivalent ownership context.

### 4. Implement the complete versionless gateway route

Use this proposed implementation for `apps/api/src/routes/files.ts`:

```ts
import { createFilesRouter } from "files-sdk/api"
import { createRouteHandler } from "files-sdk/hono"
import env from "#shared/env.ts"
import { files, FILES_MAX_UPLOAD_SIZE, FILES_MAX_URL_AGE } from "#shared/files.ts"
import { requireSession } from "#shared/middleware.ts"
import type { AuthenticatedAppContext } from "#shared/types.ts"
import { context, factory } from "#shared/utils.ts"

const router = createFilesRouter({
  allowedOrigins: env.ALLOWED_API_ORIGINS,
  authorize: () => {
    const ctx = context<AuthenticatedAppContext>()

    return {
      disposition: "attachment",
      keyPrefix: `users/${ctx.var.session.user.id}/`,
      maxExpiresIn: FILES_MAX_URL_AGE,
      maxResults: 100,
    }
  },
  files,
  maxListLimit: 100,
  maxSearchResults: 100,
  maxUploadSize: FILES_MAX_UPLOAD_SIZE,
  operations: [
    "capabilities",
    "delete",
    "download",
    "exists",
    "head",
    "list",
    "search",
    "signedUploadUrl",
    "upload",
    "url",
  ],
  secret: env.FILES_API_SECRET,
})

export default factory.createApp().all("/", requireSession, createRouteHandler(router))
```

The installed Files SDK router applies `keyPrefix` before invoking `files.upload`,
`files.head`, and `files.delete`. The hook therefore observes storage keys such as
`users/<user-id>/avatar.png`, while gateway responses remove the prefix for clients.

The singleton's `event.key` guards intentionally ignore bulk head events because reads
are not the asset-creation seam. Bulk deletion uses `DeleteManyResult.deleted`, so only
keys that were successfully removed change status.

`requireSession` runs before `createRouteHandler`, allowing both `authorize` and
`onAction` to read the session from Hono context storage. Remove the old direct `auth`
import, `auth.api.getSession()` call, and `FilesError` authorization branch.

### 5. Expose Drizzle through the database package

Keep Drizzle's package identity behind `@init/db` and expose its helpers as a namespace
from `packages/db/src/helpers.ts`:

```ts
export * as helpers from "drizzle-orm"
```

The API imports `helpers` from `@init/db/helpers`; it does not declare a separate direct
Drizzle dependency.

### 6. Limit the initial operation surface

The concrete `operations` list above permits upload, direct/presigned upload, metadata,
listing, download, URL, and deletion. It excludes `copy` and `move` because the hook
does not update destination ownership, and excludes versioning and trash operations
because the configured Files instance does not install those plugins.

### 7. Regenerate the baseline migration

Delete the existing migration SQL and metadata, then run `bun run generate` from
`packages/db`. The template deliberately keeps one starting migration and does not
preserve migration history for databases created from earlier template revisions.

### 8. Verify the change

Run the repository-managed static checks:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
```

The API workspace currently has no build task, so do not add or invoke one as part of
this change.

## Explicitly out of scope

- Implementing `/v1/assets`.
- Making the asset table the source of truth for object existence.
- Transactional guarantees between object storage and Postgres.
- A reconciliation worker for missing or stale asset rows.
- Copy and move ownership semantics.
- Organization-owned asset authorization.
- Asset labels, references, transformations, or processing pipelines.

## Follow-up work

- Design the application-owned `/v1/assets` interface around asset IDs rather than raw
  storage keys.
- Decide whether ownership should expand from a User owner to a polymorphic owner or
  separate user/organization ownership records.
- Add reconciliation if production requirements demand repair of missed hook writes.
- Define database behavior for copy, move, bulk operations, and failed uploads.
- Add domain references from future records to `assets.id` instead of duplicating
  bucket keys.
