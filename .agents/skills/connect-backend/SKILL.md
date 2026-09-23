---
name: connect-backend
description: Connect an application workspace to a backend workspace. Use when the user wants apps/app, apps/desktop, or apps/mobile to talk to the Hono API (apps/api) through Hono RPC or tRPC, or apps/mobile to talk to Convex (packages/backend).
---

Wire a client into the app by hand from the reference files in `references/`. Copy each file to its target path, then replace the placeholders with the `name` field of the matching manifest: `{{apiPackage}}` from `apps/api`, `{{backendPackage}}` from `packages/backend`, `{{authPackage}}` from `packages/auth`, `{{nativeUiPackage}}` from `packages/native-ui`, `{{utilsPackage}}` from `packages/utils`.

Supported connections. Anything else is unsupported; say so instead of improvising.

| App       | Backend | Auth                                |
| --------- | ------- | ----------------------------------- |
| `app`     | hono    | optional, uses existing auth client |
| `app`     | trpc    | optional, uses existing auth client |
| `desktop` | hono    | not supported                       |
| `desktop` | trpc    | not supported                       |
| `mobile`  | hono    | optional                            |
| `mobile`  | convex  | required                            |

## Steps

1. Confirm the backend workspace exists: `apps/api` for hono and trpc, `packages/backend` for convex. Restore a missing one with `bun template add`.
2. Add workspace dependencies to the app's `package.json` as `workspace:*`: the api package for hono and trpc; the backend and auth packages for convex; the auth package for mobile with auth.
3. Add environment keys to the app's `.env.schema` and a value to `.env.development`. `apps/app` already declares an optional `PUBLIC_API_URL`; set it in `.env.development` to select the remote API.

   | App       | Key                           | Schema comment                                        | Development value              |
   | --------- | ----------------------------- | ----------------------------------------------------- | ------------------------------ |
   | `desktop` | `PUBLIC_API_URL`              | `# @public @type=url(matches=/^https?:\/\//)`         | `http://localhost:3000`        |
   | `mobile`  | `EXPO_PUBLIC_API_URL`         | `# @public @static @type=url(matches=/^https?:\/\//)` | `http://localhost:3000`        |
   | `mobile`  | `EXPO_PUBLIC_CONVEX_URL`      | `# @public @static @type=url`                         | `https://example.convex.cloud` |
   | `mobile`  | `EXPO_PUBLIC_CONVEX_SITE_URL` | `# @public @static @type=url`                         | `https://example.convex.site`  |

4. Copy the client files for the connection into `src/`:
   - **hono**: `references/hono/api.ts.hbs` to `shared/api.ts` (`references/hono/mobile/api.ts.hbs` on mobile). Desktop and mobile also take `references/hono/<app>/utils.ts.hbs` to `shared/utils.ts`.
   - **trpc**: `references/trpc/<app>/trpc.tsx.hbs` to `shared/trpc.tsx`. Desktop also takes `references/hono/desktop/utils.ts.hbs` to `shared/utils.ts`. Install the client libraries inside the app: `bun add --exact @tanstack/react-query @trpc/client @trpc/tanstack-react-query superjson`.
   - **convex**: `references/convex/mobile/convex-provider.tsx.hbs` to `shared/components/convex-provider.tsx` and `references/convex/mobile/auth.ts.hbs` to `shared/auth.ts`.
   - **mobile auth** (convex, or hono with auth): `references/hono/mobile/auth.ts.hbs` to `shared/auth.ts` for hono, plus `references/shared/mobile-auth/_layout.tsx.hbs` to `app/(auth)/_layout.tsx`, `sign-in.tsx.hbs` to `app/(auth)/(unauthenticated)/sign-in.tsx`, and `index.tsx.hbs` to `app/(auth)/(authenticated)/index.tsx`. Existing routes stay public; only screens moved under `(authenticated)` require a session.
5. Wrap the provider tree in `src/shared/components/providers.tsx`. Edit the JSX, matching the file as it is now:
   - **trpc**: import `TRPCProvider` from `#shared/trpc.tsx`. In `app` it wraps everything. In `desktop` it sits inside `QueryClientProvider`.
   - **convex**: import `ConvexProvider` from `#shared/components/convex-provider.tsx` and wrap `PersistQueryClientProvider` with it.
   - **hono** needs no provider.
6. If the user wants an example, copy `references/<backend>/<app>/example.tsx.hbs` to `src/routes/backend-example.tsx` (`trpc-example.tsx` for trpc) in app and desktop, or under `app/` in mobile (`app/(auth)/(authenticated)/` when auth is on). After adding a route in app or desktop, regenerate the route tree:

   ```bash
   cd apps/<app> && CI=1 bun --eval 'import { resolveConfig } from "vite"; await resolveConfig({}, "build")'
   ```

7. Run `bun install`, `bun run codegen`, then `bun template doctor`. Fix what it reports. Finish when it passes.

For `apps/app`, keeping `PUBLIC_API_URL` set selects the remote Hono deployment and clearing it restores the local `/api` handler. When both run, keep the Better Auth cookie, secret, plugins, and trusted origins compatible.
