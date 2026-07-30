# 14 — Generic backend connection generator

**Status:** Completed
**Size:** M
**Depends on:** 05, 13
**Affects:** 07 (establishes the shared generator conventions that Plan 07 expands)

## Problem

Plan 05 proved that `packages/backend` can be consumed from the mobile app, but it did
so by permanently shipping a Convex demo route, provider, environment variables, and
dependency in `apps/mobile`. That conflicts with the template's lean default: a
freshly scaffolded project should not imply that Convex, Hono, or tRPC has already been
chosen.

Backend connection wiring is also too framework-specific at the command surface.
`hono-client` and `trpc-client` are separate generators today, while Convex has no
generator at all. The shared user intent is simpler: connect an app to one of the
backend options already present in the project.

## Decision

Add one Turbo generator named `connect-backend`, invoked through the standard Turbo
generator menu:

```sh
bun run generate
bun run generate connect-backend --args mobile convex false false
```

Its external interface:

- target app
- backend adapter (`convex`, `hono`, or `trpc`)
- whether to include auth client wiring (where the adapter supports it)
- whether to add an additive example

The generator is generic at the workflow level, not at the implementation level.
Each supported app/backend combination has an explicit internal adapter that owns its
dependencies, files, environment wiring, and provider integration. Unsupported
combinations fail clearly with a message from a hardcoded adapter map.

Production connection wiring is the default. Auth wiring and demo examples are opt-in
prompts. Examples are **additive-only**: a new route or screen that is easy to delete.
The generator never modifies existing consumers (dashboard, sign-up form, `getGreeting`,
`checkEmailAvailability`, or any other demo implementation), because users may have
already changed them.

## Architecture conventions (shared with Plan 07)

These conventions are established here and reused by Plan 07's recipe catalog:

- **Plain Plop generators only.** `turbo/generators/config.ts` remains the sole
  entrypoint; it imports and registers typed generator definitions from modules under
  `turbo/generators/recipes/<category>/`. Each module exports a register function (or a
  `PlopTypes`-typed definition object). No installer framework, no change-plan
  abstraction, no catalog module, no standalone scripts. Composition may be reorganized
  only if it stays typesafe without significant type wrangling.
- **Shared helpers in `turbo/generators/shared/utils.ts`:**
  - `getAppChoices` / `getAvailableApps` — plain `apps/*` discovery, no framework
    sniffing;
  - `addWorkspaceDependencies` — idempotent structural `package.json` merge;
  - `readPackageName` — discover actual package names from workspace `package.json`
    files; never hardcode `@init/`, because `bun template rename` may have changed the
    scope;
  - `ensureWorkspaceExists` — preflight helper that aborts before any write and prints
    the exact remedy (for example `bun template add package backend`).
- **Idempotency uses Plop primitives only.** `add`/`addMany` with `skipIfExists`,
  skip-functions that check for existing content, and the idempotent dependency merge.
  When every target already exists, report the connection as a no-op. Files the user has
  modified are skipped on rerun; this is an accepted trade-off. There is no snapshot
  tracking, drift detection, or rollback beyond what Plop provides.
- **Add-only rule.** Generators may only `add` files that do not exist in the default
  scaffold. Any behavior change to a file that ships in the default scaffold must be
  selected through a seam that also ships in the template (an env variable, the
  providers file, or a designated import point) — never through modifying or replacing
  the file. This is what makes `skipIfExists` safe: a skip can never silently withhold
  intended behavior. The sanctioned exceptions are purely additive merges that change
  no existing behavior: anchored env schema/`extends` additions, `.env.template`
  appends, and appending new exports to `shared/utils.ts` (skipped when the export
  already exists).
- **Skips are reported, never silent.** When a target is skipped because it already
  exists, the generator's output says so explicitly. A run must never report success
  while quietly omitting part of its work.
- **Versions: latest at generation time, exactly pinned.** Dependency installation uses
  `bun add --exact`. Version drift between packages is the user's to resolve with
  `bun run fix:monorepo`.
- **Env wiring is feature-local where possible.** Where a shared env file must be
  extended (for example adding a preset to `extends: [...]`), use a narrow Plop `modify`
  with a regex anchored on the known line, skipped when the preset is already present.
  If a user extends the same preset twice through manual edits, they fix it manually.
- **`.env.template` changes use `append`.** No dedupe beyond a skip-function that checks
  whether the key is already present.

## Work items

### 1. Restore the template seams

**Provider seam.** Re-add `src/shared/components/providers.tsx` to `apps/app`,
`apps/desktop`, and `apps/mobile` (partially reversing the inlining done in #86). The
file composes the app's providers and is imported by `__root.tsx` / `main.tsx` /
`_layout.tsx`. It is the **only** file generators touch to insert providers; generators
never rewrite root layouts or arbitrary TSX.

**API URL seam in `apps/app`.** `apps/app`'s `shared/auth.ts` and
`features/auth/server/functions.ts` exist in every fresh scaffold, so under the
add-only rule the generator can never rewrite them to point at `apps/api`. Instead the
default app becomes transport-agnostic (partially reversing plan 04's removal of
`PUBLIC_API_URL`):

- restore `PUBLIC_API_URL` as an **optional** client env value in
  `apps/app/src/shared/env.ts`:

  ```ts
  PUBLIC_API_URL: z.url({ protocol: /^https?$/ }).optional(),
  ```

- ship the fallback URL builder in `apps/app/src/shared/utils.ts` by default:

  ```ts
  export const buildApiUrl = createUrlBuilder(
    env.PUBLIC_API_URL ?? `${env.PUBLIC_BASE_URL}/api`,
    isProduction ? "https" : "http"
  )
  ```

- write the default `shared/auth.ts` and the session/password-reset server functions
  once against `authClient` + `buildApiUrl` so the identical code serves both the local
  TanStack Better Auth handler (no env var → `PUBLIC_BASE_URL/api/auth`) and a remote
  `apps/api` deployment (env var set):

  ```ts
  // apps/app/src/shared/auth.ts (default template, not generated)
  import { createAuthClient } from "@init/auth/client"
  import { adminClient, organizationClient } from "@init/auth/client/plugins"
  import { buildApiUrl } from "#shared/utils.ts"

  export const authClient = createAuthClient(buildApiUrl("/auth"), [
    adminClient(),
    organizationClient(),
  ])

  export const { useSession, signIn, signOut, signUp } = authClient
  ```

  ```ts
  // apps/app/src/features/auth/server/functions.ts (default template, not generated)
  import * as z from "@init/utils/schema"
  import { createIsomorphicFn } from "@tanstack/react-start"
  import { getRequestHeaders } from "@tanstack/react-start/server"
  import { authClient } from "#shared/auth.ts"
  import { publicFunction } from "#shared/server/functions.ts"
  import { buildUrl } from "#shared/utils.ts"

  export const validateSession = createIsomorphicFn()
    .client(async () => {
      const { data: session } = await authClient.getSession()
      return session
    })
    .server(async () => {
      const { data: session } = await authClient.getSession({
        fetchOptions: { headers: getRequestHeaders() },
      })
      return session
    })

  export const forgotPassword = publicFunction
    .validator(z.object({ email: z.email() }))
    .handler(async ({ data }) => {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        fetchOptions: { headers: getRequestHeaders() },
        redirectTo: buildUrl("/reset-password"),
      })

      if (error) throw new Error(error.message)
      return { success: true }
    })
  ```

Switching `apps/app` auth to the Hono API is thereby pure configuration: setting
`PUBLIC_API_URL` retargets the same client, and removing it falls back to the local
handler.

### 2. Introduce the `connect-backend` interface

- Register `connect-backend` in `turbo/generators/config.ts`.
- Prompts, in this documented order (with equivalent `--args` bypass):
  1. target app (from `getAppChoices`)
  2. backend (`convex`, `hono`, or `trpc`)
  3. include auth client wiring (skipped/forced where noted below)
  4. add an example
- Verify during implementation that Turbo/Plop's `--args` bypass coerces `true`/`false`
  for the confirm prompts; if it does not, use list prompts with `yes`/`no` values.
- Adapter matrix (hardcoded map; unsupported combinations fail with a clear message):

  | Backend | Targets              | Auth prompt | Notes                                    |
  | ------- | -------------------- | ----------- | ---------------------------------------- |
  | Convex  | mobile               | always on   | Convex client wiring is auth-integrated  |
  | Hono    | app, desktop, mobile | app/mobile  | subsumes the old `hono-client` generator |
  | tRPC    | app, desktop         | app only    | subsumes the old `trpc-client` generator |

- Remove the public `hono-client` and `trpc-client` generators. Their templates move
  under `turbo/generators/templates/backend-clients/` as internal adapter templates.
- Adapter definitions live under `turbo/generators/recipes/backend-clients/`.

### 3. Adapter: Convex (mobile)

Restore `apps/mobile` to a backend-neutral default:

- remove its always-on `@init/backend` dependency;
- remove the Convex URLs from its default environment schema and `.env.template`;
- remove the `convex-demo` route and feature;
- remove the always-on Convex provider integration.

The adapter then generates, from templates under
`turbo/generators/templates/backend-clients/convex/`:

- the backend workspace dependency using its discovered package name;
- env wiring via the existing `convex.expo()` preset from `@init/env/presets`
  (`EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CONVEX_SITE_URL`), merged into
  `apps/mobile/src/shared/env.ts` via the anchored `extends: [` modify, plus appended
  `.env.template` values:

  ```dotenv
  EXPO_PUBLIC_CONVEX_URL="https://example.convex.cloud"
  EXPO_PUBLIC_CONVEX_SITE_URL="https://example.convex.site"
  ```

- the Convex provider inserted through `shared/components/providers.tsx`, with a
  `ConvexQueryClient` connected to mobile's existing persisted TanStack Query client;
- the auth client at `apps/mobile/src/shared/auth.ts` (auth is always part of this
  adapter):

  ```ts
  import { convexClient } from "@init/backend/client/auth"
  import { createAuthClient } from "@init/auth/client"
  import { adminClient, organizationClient } from "@init/auth/client/plugins"
  import { expoClient } from "@init/auth/expo/client"
  import { accessControl, adminRole, memberRole, ownerRole } from "@init/auth/permissions"
  import * as SecureStore from "expo-secure-store"
  import env from "#shared/env.ts"

  export const auth = createAuthClient(env.EXPO_PUBLIC_CONVEX_SITE_URL, [
    expoClient({ storage: SecureStore }),
    convexClient(),
    adminClient(),
    organizationClient({
      ac: accessControl,
      roles: {
        admin: adminRole,
        member: memberRole,
        owner: ownerRole,
      },
    }),
  ])

  export const { useSession } = auth
  ```

- a minimal sign-in screen and guarded route group (shared templates with the Hono mobile
  variant; see §6);
- with `example` true: a small additive feature and route querying the existing public
  documents API from `packages/backend`, generated inside the
  `(auth)/(authenticated)` route group from §6. The example uses
  `useQuery(convexQuery(...))`, so loading and error states use the normal TanStack
  Query result object while Convex remains realtime. The backend client's
  `useConvexQuery` export remains the native Convex hook.

`packages/backend`'s `convex/_generated` output is committed, so generated targets
typecheck before any Convex deployment or account exists. A missing URL value is a
normal env-validation state, not special machinery. Retain the durable Plan 05
conventions in `packages/backend`: public/shared function structure, auth constants,
logging, and the example public query.

### 4. Adapter: Hono

Preserves the old `hono-client` behavior: generates `src/shared/api.ts` from the
existing template and adds the `api` workspace dependency (discovered name).

Connection wiring per app restores the API URL env value and URL builder:

`apps/app` uses the API URL seam shipped by work item 1; the adapter only appends the
env value:

```dotenv
PUBLIC_API_URL="http://localhost:3000"
```

`apps/desktop` and `apps/mobile` receive their env schema addition through the
sanctioned anchored env merge, and their URL builder through the sanctioned
`shared/utils.ts` export append (skipped when `buildApiUrl` already exists).

`apps/desktop`:

```ts
// apps/desktop/src/shared/env.ts — anchored client schema merge
PUBLIC_API_URL: z.url(),
```

```ts
// apps/desktop/src/shared/utils.ts — appended export
export const buildApiUrl = createUrlBuilder(env.PUBLIC_API_URL, isProduction ? "https" : "http")
```

```dotenv
PUBLIC_API_URL="http://localhost:3000"
```

`apps/mobile`:

```ts
// apps/mobile/src/shared/env.ts — anchored client schema merge
EXPO_PUBLIC_API_URL: z.url(),
```

```ts
// apps/mobile/src/shared/utils.ts — appended export
export const buildApiUrl = createUrlBuilder(
  env.EXPO_PUBLIC_API_URL,
  isProduction ? "https" : "http"
)
```

```dotenv
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

With auth wiring enabled:

`apps/app` generates **no auth files** — the default scaffold's auth client and server
functions already route through the `buildApiUrl` seam (work item 1). The adapter's
auth step for `apps/app` is configuration and documentation only: ensure
`PUBLIC_API_URL` is appended to `.env.template` and print/document that the local
Better Auth handler is not deleted, that `PUBLIC_API_URL` selects the remote handler
(removing it falls back to the local `/api/auth` handler), and that both deployments
must share compatible Better Auth cookie, secret, plugin, and trusted-origin
configuration.

`apps/mobile` targets `src/shared/auth.ts` (plus the shared sign-in screen and session
gate from §6):

```ts
import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
import { expoClient } from "@init/auth/expo/client"
import { accessControl, adminRole, memberRole, ownerRole } from "@init/auth/permissions"
import * as SecureStore from "expo-secure-store"
import { buildApiUrl } from "#shared/utils.ts"

export const auth = createAuthClient(buildApiUrl("/auth"), [
  expoClient({ storage: SecureStore }),
  adminClient(),
  organizationClient({
    ac: accessControl,
    roles: {
      admin: adminRole,
      member: memberRole,
      owner: ownerRole,
    },
  }),
])

export const { useSession } = auth

export function getAuthHeaders() {
  const headers = new Headers()
  const cookies = auth.getCookie()
  if (cookies) headers.set("Cookie", cookies)
  return headers
}
```

### 5. Adapter: tRPC

Adds `api` as a workspace dependency and installs `@trpc/client`,
`@trpc/tanstack-react-query`, `@tanstack/react-query`, and `superjson` with
`bun add --exact`.

`apps/app` targets `src/shared/trpc.ts`:

```ts
import type { TRPCRouter } from "api/client"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import superjson from "superjson"
import { buildApiUrl } from "#shared/utils.ts"

export const { useTRPC, useTRPCClient, TRPCProvider } = createTRPCContext<TRPCRouter>()

const url = buildApiUrl("/trpc")

export const makeTRPCClient = createIsomorphicFn()
  .server(() =>
    createTRPCClient<TRPCRouter>({
      links: [
        httpBatchStreamLink({
          headers: getRequestHeaders,
          transformer: superjson,
          url,
        }),
      ],
    })
  )
  .client(() =>
    createTRPCClient<TRPCRouter>({
      links: [
        loggerLink({
          colorMode: "ansi",
          enabled: () => import.meta.env.DEV,
        }),
        httpBatchStreamLink({
          fetch: (requestUrl, options) =>
            fetch(requestUrl, {
              ...options,
              credentials: "include",
            }),
          transformer: superjson,
          url,
        }),
      ],
    })
  )
```

The `TRPCProvider` is inserted through `shared/components/providers.tsx`. The generator
does **not** rewrite `router.tsx` or wire `trpc` into router context, and it does not
replace existing local consumers such as `getGreeting` or `checkEmailAvailability` —
those remain user-owned. With `example` true, a new additive route demonstrates a typed
query through `useTRPC`.

`apps/desktop` targets `src/shared/trpc.ts`:

```ts
import type { TRPCRouter } from "api/client"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import superjson from "superjson"
import { buildApiUrl } from "#shared/utils.ts"

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    loggerLink({
      colorMode: "ansi",
      enabled: () => import.meta.env.DEV,
    }),
    httpBatchStreamLink({
      fetch: (requestUrl, options) =>
        fetch(requestUrl, {
          ...options,
          credentials: "include",
        }),
      transformer: superjson,
      url: buildApiUrl("/trpc"),
    }),
  ],
})
```

Both variants also install the Hono-style API URL wiring from §4 for their app.

### 6. Shared mobile auth UI templates

Both mobile auth variants (Convex and Hono) install a minimal sign-in screen and a
guarded route group; the selected adapter supplies its own `#shared/auth.ts`. Auth
wiring must not install an unused client module — every generated file has a consumer.

Route protection follows Expo Router's current recommendation: `Stack.Protected` with
`guard`, not manual `<Redirect>` components (the legacy pattern). Because the add-only
rule forbids rewriting `apps/mobile/src/app/_layout.tsx`, the guards live in a
generated route group layout instead of the root layout:

The group naming mirrors `apps/app`'s routing convention (`_authenticated` /
`_unauthenticated` pathless layouts). Expo Router guards must be declared in a parent
stack, and the root layout is off-limits, so both groups live under one generated
wrapper group:

```text
apps/mobile/src/app/(auth)/
  _layout.tsx                    # generated: owns both guards
  (unauthenticated)/
    sign-in.tsx                  # only reachable while signed out
  (authenticated)/
    ...                          # only reachable while signed in
```

```tsx
// apps/mobile/src/app/(auth)/_layout.tsx
import { ActivityIndicator } from "@init/native-ui/components/activity-indicator"
import { Stack } from "expo-router"
import { View } from "react-native"
import { useSession } from "#shared/auth.ts"

export default function AuthLayout() {
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(authenticated)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(unauthenticated)" />
      </Stack.Protected>
    </Stack>
  )
}
```

- `Stack.Protected` redirects automatically when the guard flips and clears protected
  history entries on sign-out; the inverted guard hides the unauthenticated screens
  from signed-in users. No separate session-gate component exists, so nothing can
  become dead code.
- `(unauthenticated)/` holds `sign-in.tsx` initially and is the home for future
  unauthenticated screens (sign-up, forgot-password), matching `apps/app`'s
  `_unauthenticated` layout.
- Better Auth caches the session in SecureStore on native, so the `isPending` state is
  rarely visible on reload.
- With `example` true, the example screen is generated **inside** `(authenticated)/`
  so the demo exercises the full auth flow. With auth enabled and no example,
  `(authenticated)/` ships containing a minimal generated index screen so the guarded
  stack always has an available route.
- Existing default routes (such as `index.tsx`) remain public; generator output and
  documentation state explicitly that users move screens into
  `app/(auth)/(authenticated)/` to require a session.

```tsx
// apps/mobile/src/app/(auth)/(unauthenticated)/sign-in.tsx
import { Button } from "@init/native-ui/components/button"
import { Text } from "@init/native-ui/components/text"
import { useState } from "react"
import { TextInput, View } from "react-native"
import { auth } from "#shared/auth.ts"

export default function SignInScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>()

  async function signIn() {
    setError(undefined)
    const result = await auth.signIn.email({ email, password })
    if (result.error) setError(result.error.message)
  }

  return (
    <View className="flex-1 justify-center gap-4 bg-background px-6">
      <Text className="text-2xl font-semibold">Sign in</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        className="rounded-md border border-input px-4 py-3 text-foreground"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        value={email}
      />
      <TextInput
        autoComplete="current-password"
        className="rounded-md border border-input px-4 py-3 text-foreground"
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        value={password}
      />
      {error ? (
        <Text className="text-destructive" role="alert">
          {error}
        </Text>
      ) : null}
      <Button onPress={() => void signIn()}>
        <Text>Sign in</Text>
      </Button>
    </View>
  )
}
```

### 7. Safety and repeatability

- Preflight with `ensureWorkspaceExists` before any write; report the exact remedy and
  abort. Do not silently add or deploy a missing backend workspace.
- Discover package names from `package.json` files; never hardcode `@init/`.
- Use `skipIfExists` and content-check skip-functions so reruns:
  - do not duplicate dependencies, imports, providers, routes, or environment keys;
  - report an already-connected target as a no-op;
  - allow auth or example layers to be added later to an existing connection.
- Every skipped target is named in the generator output; a run never reports success
  while quietly omitting part of its work.
- Honor the add-only rule: generators never rewrite existing code in default-scaffold
  files; behavior changes happen only through shipped seams (env values,
  `providers.tsx`) or the sanctioned additive merges (env schema, `.env.template`,
  `shared/utils.ts` export appends).
- Install dependencies once after all package changes and format affected files with
  the repository's managed formatter.

### 8. Documentation

- Add `connect-backend` examples to the root README and generator documentation.
- Update `packages/backend/README.md` to describe Convex consumption as opt-in through
  the generator.
- Document the old `hono-client` / `trpc-client` command names as removed.
- Record the supported app/backend matrix and the files each adapter owns so a user can
  review or remove generated wiring.
- Explain that generators operate on the exact template snapshot already present in the
  user's project. Plan 07 expands the same machinery with copy-once template recipes;
  neither plan introduces a remote catalog or updater.

## Verification (manual)

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

Run generator smoke tests manually in disposable scaffold copies (no CI harness):

- A default mobile scaffold contains no Convex dependency, URL, provider, feature, or
  route.
- Each adapter's connection-only run produces production wiring, no demo screen, and
  the project checks without external accounts or deployments.
- Convex mobile wiring connects `ConvexQueryClient` to the existing persisted
  `QueryClient`; its example reads loading and error state from
  `useQuery(convexQuery(...))`.
- Rerunning the same command is a no-op; adding auth or the example later only adds the
  new layer.
- A renamed npm scope is discovered correctly and leaves no hardcoded `@init/`
  references.
- A missing backend workspace fails before any write and prints a concrete remedy.
- The Hono and tRPC adapters preserve the behavior of their previous generators.
- Existing demo consumers (dashboard, sign-up form, local server functions) are never
  modified.
- In a default `apps/app` scaffold, setting `PUBLIC_API_URL` routes auth and API calls
  to `apps/api` and removing it falls back to the local handler — with no file changes
  from the generator beyond the `.env.template` append.
- After mobile auth wiring, an unauthenticated user cannot reach an
  `(auth)/(authenticated)` route (the guard falls back to `sign-in`), a signed-in user
  cannot reach the `(unauthenticated)` screens, and signing out clears authenticated
  history entries.
- Skipped targets are reported explicitly in generator output.

## Acceptance criteria

- Fresh projects remain backend-neutral until the generator is invoked.
- One `connect-backend` command is the public interface for every supported adapter;
  Convex, Hono, and tRPC retain separate explicit implementations behind it.
- `shared/components/providers.tsx` exists in app, desktop, and mobile and is the only
  provider-insertion point generators use.
- `apps/app` ships transport-agnostic auth through the `PUBLIC_API_URL`/`buildApiUrl`
  seam; connecting it to `apps/api` requires no modification of default-scaffold files.
- Generators never rewrite existing code in default-scaffold files; only the
  sanctioned additive merges touch them (add-only rule).
- Production wiring does not depend on including auth or example layers.
- Generated dependencies respect the project's renamed package scope and are installed
  with `bun add --exact`.
- Supported invocations are idempotent via Plop `skipIfExists`; unsupported
  combinations fail safely.
- Generated projects pass the repository verification commands without requiring an
  external service account.

## Out of scope

- Deploying Convex or any other backend; creating external accounts or credentials.
- Automatically adding a backend workspace that is absent from the scaffold.
- Snapshot/drift detection, rollback, or any mutation machinery beyond Plop primitives.
- Modifying or replacing existing demo consumers in user projects.
- Supporting arbitrary repositories or frameworks outside maintained Init adapters.
- The copy-once recipe catalog (Plan 07).
- Updating previously scaffolded projects from newer versions of the template.
