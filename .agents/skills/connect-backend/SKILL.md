---
name: connect-backend
description: Connect an application workspace to a backend workspace. Use when the user wants apps/app, apps/desktop, or apps/mobile to talk to the Hono API (apps/api) through Hono RPC or tRPC, or to Convex (packages/backend).
---

Wire a client into the app by hand from the reference files in `references/`. Copy each file to its target path, then replace the placeholders with the `name` field of the matching manifest: `{{apiPackage}}` from `apps/api`, `{{backendPackage}}` from `packages/backend`, `{{authPackage}}` from `packages/auth`, `{{nativeUiPackage}}` from `packages/native-ui`, `{{utilsPackage}}` from `packages/utils`.

Supported connections. Anything else is unsupported; say so instead of improvising.

| App       | Backend | Auth                                    |
| --------- | ------- | --------------------------------------- |
| `app`     | hono    | optional, uses the existing auth client |
| `app`     | trpc    | optional, uses the existing auth client |
| `app`     | convex  | not supported                           |
| `desktop` | hono    | not supported                           |
| `desktop` | trpc    | not supported                           |
| `desktop` | convex  | not supported                           |
| `mobile`  | hono    | optional                                |
| `mobile`  | convex  | required                                |

## Steps

1. Confirm the backend workspace exists: `apps/api` for hono and trpc, `packages/backend` for convex. Restore a missing one with `bun template add`.
2. Add workspace dependencies to the app's `package.json` as `workspace:*`: the api package for hono and trpc; the backend package for convex, plus the auth package on mobile; the auth package for mobile with auth.
3. Add environment keys to the app's `.env.schema` and a value to `.env.development`, creating that file when the app has none. `apps/app` already declares an optional `PUBLIC_API_URL`; set it in `.env.development` to select the remote API.

   | App              | Key                           | Schema comment                                        | Development value              |
   | ---------------- | ----------------------------- | ----------------------------------------------------- | ------------------------------ |
   | `desktop`        | `PUBLIC_API_URL`              | `# @public @type=url(matches=/^https?:\/\//)`         | `http://localhost:3000`        |
   | `mobile`         | `EXPO_PUBLIC_API_URL`         | `# @public @static @type=url(matches=/^https?:\/\//)` | `http://localhost:3000`        |
   | `mobile`         | `EXPO_PUBLIC_CONVEX_URL`      | `# @public @static @type=url`                         | `https://example.convex.cloud` |
   | `mobile`         | `EXPO_PUBLIC_CONVEX_SITE_URL` | `# @public @static @type=url`                         | `https://example.convex.site`  |
   | `app`, `desktop` | `PUBLIC_CONVEX_URL`           | `# @public @required @type=url`                       | `https://example.convex.cloud` |

   The API URL keys belong to hono and trpc. The Convex keys belong to convex.

4. Copy the client files for the connection into `src/`:
   - **hono**: `references/hono/api.ts.hbs` to `shared/api.ts`. Mobile with auth takes `references/hono/mobile/api.ts.hbs` instead, which sends the session headers. Desktop and mobile also take `references/hono/<app>/utils.ts.hbs` to `shared/utils.ts`.
   - **trpc**: `references/trpc/<app>/trpc.tsx.hbs` to `shared/trpc.tsx`. Desktop also takes `references/hono/desktop/utils.ts.hbs` to `shared/utils.ts`. Install the client libraries inside the app: `bun add --exact @tanstack/react-query @trpc/client @trpc/tanstack-react-query superjson`.
   - **convex**: `references/convex/<app>/convex-provider.tsx.hbs` to `shared/components/convex-provider.tsx`.
     - `mobile` also takes `references/convex/mobile/auth.ts.hbs` to `shared/auth.ts`.
     - `app` also takes `references/convex/app/convex.ts.hbs` to `shared/convex.ts`.
   - **mobile auth** (convex, or hono with auth): `references/hono/mobile/auth.ts.hbs` to `shared/auth.ts` for hono, plus `references/shared/mobile-auth/_layout.tsx.hbs` to `app/(auth)/_layout.tsx`, `sign-in.tsx.hbs` to `app/(auth)/(unauthenticated)/sign-in.tsx`, and `index.tsx.hbs` to `app/(auth)/(authenticated)/index.tsx`. Existing routes stay public; only screens moved under `(authenticated)` require a session.
5. Wrap the provider tree in `src/shared/components/providers.tsx`. Edit the JSX, matching the file as it is now:
   - **trpc**: import `TRPCProvider` from `#shared/trpc.tsx`. In `app` it wraps everything. In `desktop` it sits inside `QueryClientProvider`.
   - **convex** in `mobile` and `desktop`: import `ConvexProvider` from `#shared/components/convex-provider.tsx` and wrap the query client provider with it (`PersistQueryClientProvider` on mobile, `QueryClientProvider` on desktop).
   - **convex** in `app`: the query client is created per request in `src/router.tsx`, so connect there instead of in `providers.tsx`. After the `QueryClient` is created, call `createConvexClient(queryClient)` from `#shared/convex.ts` and add `Wrap: ({ children }) => <ConvexProvider client={convex}>{children}</ConvexProvider>` to the `createRouter` options.
   - **hono** needs no provider.
6. If the user wants an example, copy `references/<backend>/<app>/example.tsx.hbs` into the routes directory as `backend-example.tsx` (`trpc-example.tsx` for trpc, `convex-example.tsx` for convex): `src/routes/` in app, `src/renderer/routes/` in desktop, and `src/app/` in mobile (`src/app/(auth)/(authenticated)/` when auth is on). After adding a route in app or desktop, regenerate the committed route tree by loading the Vite config that declares the router plugin:

   ```bash
   cd apps/app && CI=1 bun --eval 'import { resolveConfig } from "vite"; await resolveConfig({}, "build")'
   cd apps/desktop && CI=1 bun --eval 'import { resolveConfig } from "vite"; await resolveConfig({ configFile: "vite.renderer.config.ts" }, "build")'
   ```

7. Run `bun install`, `bun run codegen`, then `bun template doctor`. Fix what it reports. Finish when it passes.

Convex in `app` and `desktop` reaches public functions only. `apps/app` keeps its own Better Auth sessions; moving them to Convex means migrating the `/api/auth` handler, server-side token handoff, and the sign-up, reset, and social flows together, which is outside this skill.

For `apps/app`, keeping `PUBLIC_API_URL` set selects the remote Hono deployment and clearing it restores the local `/api` handler. When both run, keep the Better Auth cookie, secret, plugins, and trusted origins compatible.
