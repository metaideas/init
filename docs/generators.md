---
title: Project Generators
description: Use local template recipes to add features, package workspaces, backend connections, snippets, and Files SDK clients.
---

Run `bun run generate` to open the Turbo generator menu. Template commands use local template recipes from the exact template snapshot in the project. They do not download a catalog. They do not update previously generated files. They do not track template drift.

`turbo/generators/config.ts` registers implementations from `turbo/generators/commands`. These implementations include project scaffolds, backend connections, code snippets, and the Files SDK client integration. Put generated source in Handlebars files under `templates/`. Keep each template command direct and self-contained. Do not add shared recipe, adapter, or utility layers.

## Add code snippets

The `code-snippets` template command adds optional source code to an existing workspace:

```bash
bun run generate code-snippets
```

| Category  | Selection | Target                         | Requirements             |
| --------- | --------- | ------------------------------ | ------------------------ |
| Utilities | `codec`   | `packages/utils/src/codec.ts`  | `packages/utils`         |
| Utilities | `assert`  | `packages/utils/src/assert.ts` | `packages/utils`, `core` |

Select one or more utility snippets. The selection requires its required workspaces to exist. A repeat run skips existing targets. Workspace schemas and backend commands own environment contracts. Code-snippet presets do not own environment contracts.

## Create project scaffolds

`new-feature` creates selected files under the `src/features` directory of an application workspace:

```bash
bun run generate new-feature
```

`new-package` creates a workspace under `packages/`. It uses the current npm scope, shared TypeScript configuration, and TypeScript version of the project:

```bash
bun run generate new-package
```

Both scaffold template commands preserve existing files on a repeat run.

## Connect a backend

`connect-backend` provides one interface for the maintained backend connections:

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

The arguments specify the target application workspace, backend alternative, auth connection, and additive example. The prompts accept `true` and `false`. Convex always enables auth. Desktop requires the auth value to be `false`.

| Backend | Targets                    | Auth behavior                                                        |
| ------- | -------------------------- | -------------------------------------------------------------------- |
| Convex  | `mobile`                   | Auth is required.                                                    |
| Hono    | `app`, `desktop`, `mobile` | Auth is optional on `app` and `mobile`. Desktop does not support it. |
| tRPC    | `app`, `desktop`           | Auth is optional on `app`. Desktop does not support it.              |

Unsupported combinations fail before a write. The required backend workspace must already exist:

- Convex requires `packages/backend`. Restore it with `bun template add package backend`.
- Hono and tRPC require `apps/api`. Restore it with `bun template add app api`.

The template command reads package names from workspace manifests. Connections continue to work after `bun template rename`. It installs external tRPC dependencies with exact versions.

### Generated ownership

The connections add files and use the `shared/components/providers.tsx` seam that the template provides. Repeat runs skip user-owned files instead of replacing them. The command prints every skip.

| Connection    | Owned files and additive seams                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convex mobile | `shared/auth.ts`, `shared/components/convex-provider.tsx`, the `(auth)` route group, Convex keys in `.env.schema`, and optional `convex-example.tsx` |
| Hono app      | `shared/api.ts`, the application-owned optional `PUBLIC_API_URL`, and optional `routes/backend-example.tsx`                                          |
| Hono desktop  | `shared/api.ts`, `shared/utils.ts`, API URL schema/development values, and optional `routes/backend-example.tsx`                                     |
| Hono mobile   | `shared/api.ts`, `shared/utils.ts`, API URL schema/development values, optional `shared/auth.ts`, auth routes, and an example screen                 |
| tRPC app      | `shared/trpc.tsx`, provider seam entry, the application-owned optional `PUBLIC_API_URL`, and optional `routes/trpc-example.tsx`                      |
| tRPC desktop  | `shared/trpc.tsx`, provider seam entry, `shared/utils.ts`, API URL schema/development values, and optional `routes/trpc-example.tsx`                 |

Examples are additive. You can delete them independently. The command does not modify existing dashboards, sign-up forms, server functions, or default mobile routes. On mobile, only screens moved into `app/(auth)/(authenticated)/` require a session. The default routes remain public.

The Convex mobile provider connects `ConvexQueryClient` to the existing persisted TanStack Query client of the application workspace. Generated queries use `useQuery(convexQuery(api.example.query, args))`. They retain Convex real-time updates and expose TanStack Query states such as `isPending` and `isError`. The backend client export `useConvexQuery` remains the native Convex hook for cases that require it.

For `apps/app`, setting `PUBLIC_API_URL` selects the remote Hono auth/API deployment. Removing it restores the local `${PUBLIC_BASE_URL}/api` handler. When you use both deployments, keep the Better Auth cookie, secret, plugin, and trusted-origin configuration compatible.

The former `hono-client` and `trpc-client` commands are removed. Use `connect-backend` to apply dependency, environment, provider, auth, and example connections consistently.

## Add a Files SDK client

`apps/api` always includes the authenticated Files SDK gateway at `/files`, with the built-in tRPC and Hono routes. Its `src/shared/files.ts` composition uses the native S3 adapter of Bun with local MinIO defaults. Every operation requires the existing init session. Each operation has the scope `users/<user-id>/`. Uploads have a 10 MiB limit. By default, they accept images and PDF files.

Generate the optional client in an application workspace that consumes the API:

```bash
bun run generate files-client
bun run generate files-client --args app https://api.init.localhost/files
bun run generate files-client --args web https://api.init.localhost/files
```

The template command can target any workspace under `apps/`. It creates `src/shared/files.ts`. It exports the application-local `useFiles` hook, `useFile`, `useList`, and `useSearch`. It authenticates JSON and XHR upload traffic. Astro consumers use the same React integration through the Astro React renderer.

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

Use `files.download(key)` when code requires the bytes. Use `files.url(key)` for an `img`, anchor, or video source when the selected adapter supports signed URLs. The hook also exposes `files.error`, `files.abort()`, `files.reset()`, and capability checks. A repeat run reports skips without replacing generated application code.
