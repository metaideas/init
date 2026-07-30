# Plan 04 — CLI manifest & setup rework

Make the TanStack Start app independently useful, then replace the hardcoded, drifted workspace list in `cli/src/workspaces.ts` with a **generated manifest**, add transitive dependency resolution and workspace compatibility guidance to `init-now setup`, and support non-interactive use.

Prereqs: plan 01 (correctness fixes), plan 02 (final package set), and plan 09 (Effect v4 + adamantite + service structure) should land first — write this feature work against the v4 APIs and the `lib/services` structure plan 09 introduces.

## Problem summary

- `cli/src/workspaces.ts` is a handwritten `as const` list of apps/packages with dependency arrays. It has already drifted from reality (~12 packages list wrong `@init/*` deps), and the package-level `dependencies` arrays are never read by any code.
- `setup` (`cli/src/commands/setup.ts:137-171`) resolves app→package dependencies only one level deep. Concrete failure: selecting the `api` app keeps `db` but drops packages `db` itself depends on → dangling `workspace:*` deps → broken install.
- The CLI test (`cli/src/__tests__/workspaces.test.ts`) validates apps only — exactly not where the drift is.
- `apps/app` currently imports `api/client`, sends authentication to `apps/api`, and uses API-hosted tRPC for a greeting and email-availability check. This makes the full-stack TanStack Start app unusable without also retaining Hono, even though TanStack Start supports its own server routes and server functions.
- Everything is prompt-driven; unusable in CI.

## 1. Make `apps/app` standalone

The default TanStack Start app must run independently with its own server capabilities. `apps/api` (Hono), `packages/backend` (Convex), and TanStack Start's built-in server runtime are three valid choices, not a hierarchy where the app implicitly requires Hono.

### Local authentication

Move the Better Auth composition needed by the web app into `apps/app`. Mount it on a TanStack Start server route and point the existing auth client at the same-origin route.

`apps/app/src/features/auth/server/auth.ts`:

```ts
import { AUTH_APP_NAME, AUTH_COOKIE_PREFIX } from "@init/auth/constants"
import { tanstackStartCookies } from "@init/auth/integrations/start"
import { createAuth, databaseAdapter } from "@init/auth/server"
import { admin, organization } from "@init/auth/server/plugins"
import { database } from "@init/db/client"
import { sendEmail } from "@init/email/client"
import PasswordReset from "@init/email/templates/password-reset"
import { seconds } from "qte"
import env from "#shared/env.ts"

export const auth = createAuth({
  advanced: {
    cookiePrefix: AUTH_COOKIE_PREFIX,
    database: { generateId: false },
  },
  appName: AUTH_APP_NAME,
  basePath: "/api/auth",
  baseURL: env.PUBLIC_BASE_URL,
  database: databaseAdapter(database()),
  emailAndPassword: {
    autoSignIn: true,
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(PasswordReset({ resetUrl: url }), {
        emails: [user.email],
        subject: `Reset your ${AUTH_APP_NAME} password`,
      })
    },
  },
  plugins: [admin(), organization(), tanstackStartCookies()],
  secret: env.AUTH_SECRET,
  session: {
    expiresIn: seconds("30d"),
    updateAge: seconds("15d"),
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      enabled: true,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: true,
    },
  },
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
})
```

`apps/app/src/routes/api/auth/$.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router"
import { auth } from "#features/auth/server/auth.ts"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
})
```

`apps/app/src/shared/auth.ts` keeps the UI-facing Better Auth interface stable:

```ts
import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
import { buildUrl } from "#shared/utils.ts"

export const authClient = createAuthClient(buildUrl("/api/auth"), [
  adminClient(),
  organizationClient(),
])

export const { useSession, signIn, signOut, signUp } = authClient
```

Extend `apps/app/src/shared/env.ts` with the `auth()`, provider, `db()`, and `resend()` presets needed by the local composition. Add `@init/db`, `@init/email`, and `qte` to `apps/app/package.json`.

### Local server functions

Replace the API-hosted tRPC demo and email check with TanStack Start server functions. Keep database/auth helpers server-only and expose only validated functions to routes/components.

```ts
import { database } from "@init/db/client"
import * as z from "@init/utils/schema"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "#features/auth/server/auth.ts"
import { publicFunction } from "#shared/server/functions.ts"

async function getCurrentSession() {
  return auth.api.getSession({ headers: getRequestHeaders() })
}

export const validateSession = publicFunction.handler(getCurrentSession)

export const getGreeting = publicFunction.handler(async () => {
  const session = await getCurrentSession()
  if (!session) throw new Error("Unauthorized")

  return { message: `Hello, ${session.user.name}!` }
})

export const checkEmailAvailability = publicFunction
  .validator(z.object({ email: z.email() }))
  .handler(async ({ data }) => {
    const user = await database().query.users.findFirst({
      where: (table, { eq }) => eq(table.email, data.email),
    })

    return { isAvailable: !user }
  })
```

The dashboard loader calls `getGreeting()` directly, and the sign-up form calls `checkEmailAvailability()` instead of tRPC. Protect each server function that reads private data inside the function; route guards are navigation UX, not an authorization boundary.

### Remove the hard coupling

- Delete the app's `api: "workspace:*"` dependency and both `TRPCRouter` imports.
- Remove the app-wide tRPC provider/context and the now-unused `@trpc/client` and `@trpc/tanstack-react-query` dependencies.
- Remove `PUBLIC_API_URL` from the default app env schema/template. The local template recipes in plan 07 add it when a project opts into a remote Hono API.
- Keep `apps/api` fully functional for mobile, desktop, extensions, third-party clients, or projects that deliberately choose a separately deployed Hono backend.
- Do not add a local/remote abstraction before installing a second adapter. TanStack server functions are the default implementation; plan 07 installs the real remote adapters at the seam when requested.

## 2. Generated manifest

Create a generator (suggested: `cli/scripts/generate-manifest.ts`, runnable via `bun run --cwd cli generate:manifest`) that walks the template's `apps/*/package.json`, `packages/*/package.json`, `tooling/*/package.json` and emits `manifest.json` at the repo root containing, per workspace:

- `name` (npm name), `dir` (e.g. `packages/db`), `type` (`app` | `package` | `tooling`)
- `description` (from package.json `description` — add descriptions to workspace package.jsons where missing, migrating the prose currently in `workspaces.ts`)
- `relationships`: normalized edges to other workspaces. Each edge has a `target`, a `kind` (`required` or `recommended`), its dependency section when applicable, and a human-readable `reason` for recommendations.
- template metadata that today lives in hardcoded CLI lists: files/dirs that are template-internal (the `cleanupInternalFiles` list from `setup.ts:95-110`, `EXCLUDED_DIRS` from `utils.ts:163-180`) — a single `internalPaths` array in the manifest so setup/update share one source of truth (update uses it in plan 06).

Workspace relationships must be colocated with the workspace that owns them, not hardcoded in CLI commands:

- Every `workspace:*` dependency is generated as `required` by default.
- An optional `init.relationships` field in a workspace's `package.json` can declare a non-dependency recommendation or override a workspace dependency from `required` to `recommended`, with a reason shown to the user.
- The generator validates that every relationship target exists, every kind is supported, every recommendation has a reason, and workspace names/directories are unique.

Example workspace metadata:

```json
{
  "init": {
    "relationships": {
      "worker": {
        "kind": "recommended",
        "reason": "Background jobs run inline unless the worker app is selected."
      }
    }
  }
}
```

The relationship model is workspace-type agnostic. It must handle app→app, app→package, package→package, and package→app edges without adding named special cases such as `if (workspace === "app")`.

Wiring:

- Commit `manifest.json`; add a CI check (in `adamantite.yml` or `tests.yml`) that regenerates and diffs it, failing when stale. This replaces the drift-prone test.
- The CLI reads the manifest from the _downloaded/cloned template tree_ at runtime (giget result for create/setup, clone for update) — never from a bundled copy — so a published CLI always matches the template snapshot it's operating on.
- Compatibility check (enabled by lockstep versioning, plan 08): after fetching a template snapshot, compare the CLI's own version against the snapshot's version and warn on **major** mismatch, suggesting `bunx init-now@latest`. Guards stale globally-installed CLIs against manifest/layout changes.
- Delete `cli/src/workspaces.ts` and its test; add tests for the manifest reader + resolver instead.

## 3. Generic workspace selection resolver

Implement one pure module used by both `setup` and `add`. Its interface accepts the manifest and the workspaces explicitly selected by the user and returns a selection plan:

- selected workspaces after the transitive `required` closure
- why each automatically included workspace is required, so the UI can explain and lock it
- all omitted `recommended` relationships, grouped for one confirmation
- package-manifest dependency entries to remove when the user confirms omission of a recommended workspace
- undeclared dangling relationships that must fail validation

The resolver owns graph traversal, cycle handling, relationship validation, and omission planning. Commands must not reproduce this logic or inspect specific workspace names. A visited set makes required cycles safe; recommendation cycles never force selection.

This is the seam for tests: table-driven graph fixtures exercise the resolver through this interface. Adding a fixture with a new workspace relationship must work without changing the resolver or either command.

## 4. Setup: workspace selection + transitive resolution

Rework `cli/src/commands/setup.ts`:

Keep the existing two-phase mental model. Setup must not ask users to choose a backend or present TanStack Start, Hono, and Convex as named architecture modes.

1. **App multiselect**: ask which apps to keep and present every app uniformly. `app` and `api` are ordinary app choices.
2. **Package multiselect**: ask which packages to keep. Preselect and lock the transitive required closure of the selected apps; `backend` is an ordinary package choice. Resolve again after package selection so dependencies of newly selected packages are included.
3. **Check recommendations**: after all selections, use the resolver's grouped omissions to explain every missing recommendation and ask once whether to return to selection or continue. Do not silently select, lock, or retain recommended workspaces.
4. **Post-prune validation**: after deleting unselected workspaces, apply the resolver's planned package-manifest edits so `bun install` can complete when recommended workspaces are deliberately omitted. Scan remaining `package.json`s for other `workspace:*` deps pointing at deleted workspaces and scan for imports from deleted workspaces. Fail on undeclared dangling relationships; report confirmed, missing recommendations as warnings with the affected source imports so users know what they must adapt.
5. Use the shared `internalPaths` from the manifest for cleanup instead of the hardcoded list.

## 5. Create-time version pinning

The root create command (`cli/src/index.ts:76`) downloads `github:metaideas/init` — the tip of `main` — so scaffolded projects can contain unreleased content while `.template-version.json` records the last release cut on `main`. Fix:

- Default the create command to the **latest release tag**: resolve it via the existing `getLatestRelease` logic and pass it as giget's ref (`github:metaideas/init#<tag>`). Fall back to `main` with a printed warning if the release lookup fails (offline/rate-limited).
- Add `--ref <tag|branch>` to override (mirrors plan 06's update flag).
- `setup` stamps `.template-version.json` with the version actually scaffolded (bare semver, per plan 01's format fix) instead of trusting the committed value.

## 6. Non-interactive mode

Add flags to `setup` (and the root create command where relevant): `--name <name>`, `--apps <a,b>`, `--packages <a,b>`, `--yes` (accept defaults and recommendation warnings, skip confirmations), `--no-install`, `--no-git`. Every prompt must have a flag equivalent. Validate flag values against the manifest, and print any unfulfilled recommendations even when `--yes` acknowledges them.

## 7. `add` command alignment

`cli/src/commands/add.ts` currently offers workspaces from the hardcoded list and copies from `main`. Update it to:

- Read available workspaces from the manifest (fetched from the template at the project's recorded version — see plan 06's ref-pinning; until then, `main` with a warning).
- Feed the requested workspace and the project's existing workspaces through the same selection resolver used by setup. Offer to add the returned required closure and show the same grouped recommendation warnings.
- After copying: rewrite `@init/*` → project scope if the project was renamed (reuse `replaceProjectNameInProjectFiles`, scoped to the new workspace dirs), and run `bun install`.
- Make `add app` and `add package` consistent (both should handle scope prefixing and `--destination` the same way).

## Acceptance criteria

- `manifest.json` generated, committed, CI-checked for staleness; `cli/src/workspaces.ts` deleted.
- Scaffolding with only `app` selected produces a working TanStack Start app with local Better Auth, session protection, password reset, email-availability validation, and the greeting server function; it has no `api` workspace dependency or tRPC client dependencies.
- Scaffolding with only `api` selected produces a project where `bun install && bun run check` passes (transitive closure kept `db`'s deps).
- `init-now setup --yes --apps app --name demo` completes with zero prompts.
- Setup contains only the app and package selection phases; it has no backend question, backend mode, or conditional backend-specific flow.
- Selecting `app`, `api`, or `backend` never silently selects either of the others; any combination can be retained.
- Adding a new required or recommended workspace relationship requires only package metadata plus a regenerated manifest; neither `setup` nor `add` changes.
- `cd cli && bun test` covers manifest parsing and validation, arbitrary transitive graphs, required and recommendation cycles, grouped recommendation warnings, omission pruning, the api→db closure, independent app/API/Convex selection, and flag validation. App-level tests are intentionally out of scope for now.
