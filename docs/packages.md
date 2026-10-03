---
title: Package Guidance
description: Understand the shared package workspaces, hosted backend package, key-value storage, and workflow conventions in init.
---

Shared libraries and hosted backends are in `packages/`. Application workspaces consume them through workspace dependencies. Package names use the configured scope of the project.

Use `bun template add package <name>` to restore an available package workspace that setup removed. See [Project structure](./architecture/project-structure.md) for the full package catalog.

## Convex Backend

`packages/backend` is a hosted backend built with Convex and Better Auth. Application workspaces consume its generated API types and React client as a package workspace. Convex deploys the functions independently.

Use the `connect-backend` skill in `.agents/skills/` to add the client, environment, provider, and optional example connections to `apps/app`, `apps/desktop`, or `apps/mobile`. It does not deploy Convex or create credentials.

Run `bun run --filter @init/backend dev` to connect the package to a Convex deployment.

### Structure

- `src/client/` — React client and auth adapters
- `src/functions/public/` — public queries and mutations
- `src/functions/system/` — operational functions such as health checks
- `src/functions/shared/` — middleware, auth, logging, and environment configuration
- `src/functions/_generated/` — generated API and data-model types

## Key-Value Storage

`packages/kv` provides key-value storage through [unstorage](https://unstorage.unjs.io/). By default, it uses the Redis driver of unstorage.

`kv` exports a shared unstorage `Storage` instance. `normalizeKey(...parts)` joins key parts with `:`. `namespaceKey(namespace)` returns a key helper with the namespace prefix.

Values must be JSON-serializable. The storage returns dates as strings.

To use another backend, change the driver passed to `createStorage` in `packages/kv/src/client.ts`.

## Workflows

`packages/workflows` runs durable background workflows through [DBOS](https://docs.dbos.dev/). DBOS stores workflow inputs, step outputs, and queues in a `dbos` schema in Postgres, so workflows need a Postgres database. It runs inside the application process: there is no separate workflow server, signing key, or hosted account.

An application workspace creates one `Workflows` instance per process. Pass a `url`, and workflows open their own small connection pool:

```ts
import { Workflows } from "@init/workflows/client"

export const workflows = new Workflows({
  poolSize: 5,
  queues: { default: { concurrency: 10 } },
  url: ENV.DATABASE_URL,
})
```

The separate pool keeps workflow traffic and request traffic from waiting on each other's connections. It adds `poolSize` connections to each process, and DBOS holds one of them open to listen for notifications. When a Postgres connection limit is tight, pass a `pg` `Pool` as `pool` instead, and workflows share it.

Define every workflow before `workflows.launch()`. Each `step` result is saved, so after a crash the workflow resumes from the first step that did not finish. A step can run more than once, so keep its side effects idempotent. `sleep` is durable across restarts.

```ts
export const greetUser = workflows.define("greetUser", async ({ userId }: { userId: string }) => {
  const greeting = await workflows.step("composeGreeting", () => `Hello, ${userId}`, {
    attempts: 3,
  })

  await workflows.sleep(1000)

  return { greeting }
})

await workflows.run(greetUser, { userId }, { id: `greet-${userId}`, queue: "default" })
```

Runs with the same `id` execute once. `queue` limits how many runs of that queue execute at once. Call `workflows.shutdown()` before the process exits.

Run workflows in a single process per application version. Every process uses the same DBOS executor ID, and on startup a process resumes every unfinished run of its version, including runs that another process is still executing. A second API instance, or a restart or deploy that starts the new process before the old one stops, can therefore execute the same steps twice. Stop the old process before the new one starts. Running several instances needs a distinct executor ID per process and a plan to recover the runs of a process that stops for good, such as [DBOS Conductor](https://docs.dbos.dev/production/conductor).

DBOS tags each run with an application version, which defaults to a hash of the workflow code, and recovers only runs that match the current version. After a deploy that changes workflow code, runs that the previous version left unfinished do not resume on their own. Keep a process on the previous version until they drain, or move them to the new version. See [Upgrading Workflow Code](https://docs.dbos.dev/typescript/tutorials/upgrading-workflows).

`bun run --filter @init/workflows reset` drops the local `dbos` schema, which removes workflow runs, queues, and history. Resetting the database clears only the application tables, so reset workflows with it. Otherwise unfinished runs resume against the new data. Stop the API first. It recreates the schema the next time it launches.

## Native UI

`packages/native-ui` provides the React Native component library for `apps/mobile`, built with [React Native Reusables](https://reactnativereusables.com) (Uniwind variant) and [RN Primitives](https://rnprimitives.com). Components are copy-owned source vendored from the React Native Reusables Uniwind registry and adapted to repository conventions; upstream is a reference, not a dependency.

Import one component per subpath, and the theme through the CSS entry:

```tsx
import { Button } from "@init/native-ui/components/button"
```

```css
@import "@init/native-ui/globals.css";
```

### Components

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, button, card, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, icon, input, label, large-title-header, menubar, native-only-animated-view, popover, progress, radio-group, select, separator, skeleton, switch, tabs, text, textarea, toggle, toggle-group, tooltip.

`large-title-header` is a local component (iOS native large-title header with search bar, plus an Android/web fallback) with no upstream equivalent.

Overlay components (`alert-dialog`, `context-menu`, `dialog`, `dropdown-menu`, `hover-card`, `menubar`, `popover`, `select`, `tooltip`) render through `@rn-primitives/portal`, so the consuming app must mount a `PortalHost` near the root (see `apps/mobile/src/shared/components/providers.tsx`).

Icons use [lucide-react-native](https://lucide.dev) through the `Icon` wrapper. Consuming apps that render icons must list `lucide-react-native` in their own dependencies (as `apps/mobile` does), since the icon components are imported directly:

```tsx
import { ArrowRight } from "lucide-react-native"
import { Icon } from "@init/native-ui/components/icon"

;<Icon as={ArrowRight} className="size-4 text-muted-foreground" />
```

### Adding or updating components

The package has a `components.json` pointing at the React Native Reusables Uniwind registry:

```sh
bun run components:add @rnr/<name>   # add or overwrite from the registry
bun run components:diff @rnr/<name>  # inspect upstream changes
```

After adding a component, re-apply the local conventions: move files from `src/components/ui/` up to `src/components/`, change the `cn` import to the `cn` package, and run `bun run fix` and `bun run check` from the repository root.

On native, set the placeholder color of a text input with `placeholderTextColorClassName` and an `accent-*` class. Uniwind does not apply the `placeholder:` variant on native.

### Upstream review

Component sources are adapted from [founded-labs/react-native-reusables](https://github.com/founded-labs/react-native-reusables) (MIT), vendored at commit `119d0b101ff0d18408dc392120e12b5c78ae0c05` (2026-07-02).

To review upstream changes:

1. Compare the pinned commit with the upstream default branch. Examine only `packages/registry/src/uniwind`.
2. For each changed component, run `bun run components:diff @rnr/<name>` and read the diff. Do not overwrite a file that has local changes; apply the upstream change manually.
3. Update the pinned commit in the same change.

Do not add an automated updater that overwrites the package.
