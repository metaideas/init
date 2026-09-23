---
title: Package Guidance
description: Understand the shared package workspaces, hosted backend package, and key-value storage conventions in init.
---

Shared libraries and hosted backends are in `packages/`. Application workspaces consume them through workspace dependencies. Package names use the configured scope of the project.

Use `bun template add package <name>` to restore an available package workspace that setup removed. See [Project structure](./architecture/project-structure.md) for the full package catalog.

## Convex Backend

`packages/backend` is a hosted backend built with Convex and Better Auth. Application workspaces consume its generated API types and React client as a package workspace. Convex deploys the functions independently.

Use the `connect-backend` skill in `.agents/skills/` to add the client, environment, provider, and optional example connections to `apps/mobile`. It does not deploy Convex or create credentials.

Run `bun run --filter @init/backend dev` to connect the package to a Convex deployment.

### Structure

- `src/client/` — React client and auth adapters
- `src/functions/public/` — public queries and mutations
- `src/functions/private/` — admin-only functions
- `src/functions/system/` — operational functions such as health checks
- `src/functions/shared/` — middleware, auth, logging, and environment configuration
- `src/functions/_generated/` — generated API and data-model types

## Key-Value Storage

`packages/kv` provides key-value storage through [unstorage](https://unstorage.unjs.io/). By default, it uses the Redis driver of unstorage.

`kv()` returns the shared unstorage `Storage` instance when code first requests it. `normalizeKey(...parts)` joins key parts with `:`. `namespaceKey(namespace)` returns a key helper with the namespace prefix.

Values must be JSON-serializable. The storage returns dates as strings.

To use another backend, change the driver passed to `createStorage` in `packages/kv/src/client.ts`.

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
