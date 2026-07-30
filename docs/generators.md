# Project generators

Run `bun run generate` to open Turbo's generator menu. Generators are local recipes
from the exact template snapshot in the project. They do not download a catalog,
update previously generated files, or track template drift.

## Connect a backend

`connect-backend` has one interface for the maintained backend adapters:

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
and `false` are accepted for both confirm prompts. Interactive runs skip auth for
Convex and desktop targets. Positional runs retain the stable four-argument shape;
Convex forces auth on, while desktop requires the auth value to be `false`.

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

All adapters add files and use the shipped `shared/components/providers.tsx` seam.
Reruns skip user-owned files rather than replacing them, and every skip is printed.

| Adapter       | Owned files and additive seams                                                                                                                                |
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
