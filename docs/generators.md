# Project generators

Run `bun run generate` to open Turbo's generator menu. Generators are local recipes
from the exact template snapshot in the project. They do not download a catalog,
update previously generated files, or track template drift.

`turbo/generators/config.ts` registers implementations from
`turbo/generators/commands`, including project scaffolds, backend connections, code
snippets, and the Files SDK client integration. Generated source belongs in
Handlebars files under `templates/`. Keep each generator direct and self-contained
instead of introducing shared recipe, adapter, or utility layers.

## Add code snippets

The `code-snippets` generator adds optional source code to an existing workspace:

```bash
bun run generate code-snippets
```

| Category            | Selection                   | Target                         | Requirements             |
| ------------------- | --------------------------- | ------------------------------ | ------------------------ |
| Utilities           | `codec`                     | `packages/utils/src/codec.ts`  | `packages/utils`         |
| Utilities           | `assert`                    | `packages/utils/src/assert.ts` | `packages/utils`, `core` |
| Environment presets | `openai`, `anthropic`, `s3` | `packages/env/src/presets.ts`  | `packages/env`           |

Choose **Utilities** or **Environment presets**, then select one or more snippets from
that category. Utility snippets create user-owned files once. Environment presets
prepend all selected preset exports in one operation.

Code snippet selections assume their required workspaces already exist. Existing targets
are skipped, so rerunning a utility or selecting an installed environment preset does
not duplicate it.

Environment presets validate values but do not automatically attach themselves to an
app. Extend a selected preset from the relevant app or package environment
configuration when that integration is needed.

## Create project scaffolds

`new-feature` creates selected files under an app's `src/features` directory:

```bash
bun run generate new-feature
```

`new-package` creates a workspace under `packages/` using the project's current npm
scope, shared TypeScript configuration, and TypeScript version:

```bash
bun run generate new-package
```

Both scaffold generators preserve existing files on rerun.

## Connect a backend

`connect-backend` has one interface for the maintained backend connections:

```bash
bun run generate connect-backend
bun run generate connect-backend --args <app> <backend> <auth> <example>
```

For example:

```bash
bun run generate connect-backend --args mobile convex false false
bun run generate connect-backend --args app hono true false
bun run generate connect-backend --args desktop trpc false true
```

The arguments are the target app, backend, auth wiring, and additive example. `true`
and `false` are accepted for both confirm prompts. Convex always enables auth, while
desktop requires the auth value to be `false`.

| Backend | Targets                    | Auth behavior                                          |
| ------- | -------------------------- | ------------------------------------------------------ |
| Convex  | `mobile`                   | Required                                               |
| Hono    | `app`, `desktop`, `mobile` | Optional on `app` and `mobile`; unavailable on desktop |
| tRPC    | `app`, `desktop`           | Optional on `app`; unavailable on desktop              |

Unsupported combinations fail before writing. The required backend workspace must
already exist:

- Convex requires `packages/backend`; restore it with
  `bun template add package backend`.
- Hono and tRPC require `apps/api`; restore it with `bun template add app api`.

Package names are read from workspace manifests, so connections continue to work after
`bun template rename`. External tRPC dependencies are installed with exact versions.

### Generated ownership

The connections add files and use the shipped `shared/components/providers.tsx` seam.
Reruns skip user-owned files rather than replacing them, and every skip is printed.

| Connection    | Owned files and additive seams                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convex mobile | `shared/auth.ts`, `shared/components/convex-provider.tsx`, the `(auth)` route group, the Convex env preset and template values, optional `convex-example.tsx` |
| Hono app      | `shared/api.ts`, `PUBLIC_API_URL` in `.env.template`, optional `routes/backend-example.tsx`                                                                   |
| Hono desktop  | `shared/api.ts`, `shared/utils.ts`, API URL env schema/template wiring, and optional `routes/backend-example.tsx`                                             |
| Hono mobile   | `shared/api.ts`, `shared/utils.ts`, API URL env schema/template wiring, optional `shared/auth.ts`, `(auth)` route group, and backend example screen           |
| tRPC app      | `shared/trpc.tsx`, provider seam entry, `PUBLIC_API_URL` in `.env.template`, optional `routes/trpc-example.tsx`                                               |
| tRPC desktop  | `shared/trpc.tsx`, provider seam entry, `shared/utils.ts`, API URL env schema/template wiring, and optional `routes/trpc-example.tsx`                         |

Examples are additive and can be deleted independently. Existing dashboards, sign-up
forms, server functions, and default mobile routes are not modified. On mobile, only
screens moved into `app/(auth)/(authenticated)/` require a session; the default routes
remain public.

The Convex mobile provider connects `ConvexQueryClient` to the app's existing persisted
TanStack Query client. Generated queries use
`useQuery(convexQuery(api.example.query, args))`, so they retain Convex realtime updates
while exposing TanStack Query states such as `isPending` and `isError`. The backend
client's `useConvexQuery` export remains the native Convex hook for cases that need it.

For `apps/app`, setting `PUBLIC_API_URL` selects the remote Hono auth/API deployment.
Removing it restores the local `${PUBLIC_BASE_URL}/api` handler. When both deployments
are used, keep Better Auth cookie, secret, plugin, and trusted-origin configuration
compatible.

The former `hono-client` and `trpc-client` commands are removed. Use
`connect-backend` so dependency, environment, provider, auth, and example wiring are
applied consistently.

## Add a Files SDK client

`apps/api` always includes the authenticated Files SDK gateway at `/files`, alongside
the built-in tRPC and Hono routes. Its `src/shared/files.ts` composition uses Bun's
native S3 adapter with local MinIO defaults. Every operation requires the existing Init
session and is scoped to `users/<user-id>/`. Uploads are limited to 10 MiB and accept
images and PDF files by default.

Generate the optional client in an app that consumes the API:

```bash
bun run generate files-client
bun run generate files-client --args app http://localhost:3000/files
bun run generate files-client --args web http://localhost:3000/files
```

The generator can target any workspace under `apps/`. It creates
`src/shared/files.ts`, exports the app-local `useFiles` hook plus `useFile`, `useList`,
and `useSearch`, and authenticates both JSON and XHR upload traffic. Astro consumers use
the same React integration through Astro's React renderer.

```tsx
import { useFiles, useList } from "#shared/files.ts"

function FilesExample() {
  const files = useFiles()
  const listing = useList({ prefix: "documents/" })

  async function upload(file: File) {
    await files.upload(file, {
      onProgress: ({ fraction }) => console.log(fraction),
    })
    await listing.refetch()
  }

  return null
}
```

Use `files.download(key)` when code needs the bytes. Use `files.url(key)` for an
`img`, anchor, or video source when the selected adapter supports signed URLs. The hook
also exposes `files.error`, `files.abort()`, `files.reset()`, and capability checks.
Rerunning the generator reports skips without replacing generated application code.
