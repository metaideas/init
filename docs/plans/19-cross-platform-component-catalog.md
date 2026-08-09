# Plan 19 — Add the cross-platform component catalog

**Status:** Planned
**Size:** L

Add `apps/catalog` as an optional application workspace for developing, inspecting, and
verifying the template's existing web and native UI packages. The workspace owns two
Storybook implementations behind one small command interface: a Vite/browser renderer
for `@init/ui` and an Expo/Metro renderer for `@init/native-ui` that can run on iOS and
Android simultaneously.

This plan establishes the verification environment only. It must not import the full
React Native Reusables registry; that work belongs to Plan 20. Use a representative
vertical slice of existing components to prove the catalog's architecture, styling,
providers, platform behavior, and template-selection semantics.

## Decisions

- Place the independently runnable development surface at `apps/catalog`.
- Keep the application workspace optional during template setup and unselected by
  default.
- Depend directly on `@init/ui`, `@init/native-ui`, and `@init/core`; selecting the
  catalog therefore keeps those package workspaces through existing dependency
  closure.
- Keep Storybook configuration and stories inside `apps/catalog` so reusable packages
  do not acquire Storybook dependencies.
- Use `.storybook` for the browser implementation and `.rnstorybook` for the native
  implementation. These are internal tool conventions, while `catalog` remains the
  vendor-neutral workspace name and interface.
- Keep `@init/core` renderer-neutral. Catalog scenarios may consume its exported domain
  values and behavior, but the package must not depend on browser or native UI.
- Make browser development the workspace's default `dev` task. Native simulators and
  devices remain explicit commands and must not launch during an ordinary root
  `bun run dev`.

## 1. Record the upstream template decision

Add an ADR under `docs/template/adr/` that records:

- why a cross-platform catalog is an application workspace rather than configuration
  embedded in `@init/ui` or `@init/native-ui`;
- why the workspace owns two renderers instead of forcing web and native code through
  React Native Web;
- the direct dependency and story-ownership decisions;
- why the workspace is selectable but not selected by default;
- how the browser, iOS, and Android render targets divide responsibility;
- that expanding `@init/native-ui` from React Native Reusables remains a separate,
  gated initiative.

Update `docs/architecture/project-structure.md` after the implementation is proven.
Describe the catalog as a development and verification application, not as the design
system itself.

## 2. Prove compatibility with a vertical slice

Before completing the workspace shell, prove the current toolchain with the smallest
representative slice:

- render `@init/ui` Button in the browser;
- render `@init/native-ui` Button, Text, and ActivityIndicator in an iOS simulator and
  Android emulator;
- start one Metro process and connect both native targets;
- synchronize native story selection and args through Storybook WebSockets;
- render light and dark themes;
- consume one exported value from `@init/core` in a shared scenario and present that
  result through separate web and native stories;
- exercise one component that requires a provider or contextual adapter.

Validate the exact installed versions of React, React Native, Expo, Vite, TypeScript,
Uniwind, Storybook, and its native packages. Stop and record a blocker before building
out the remaining structure if the spike requires a maintained fork, incompatible
major versions, or a brittle private integration.

Determine during the spike whether one TypeScript configuration can safely cover DOM
and React Native globals. Prefer separate web and native TypeScript configurations if
the combined interface creates global conflicts or hides platform-specific errors.

## 3. Establish the workspace interface

Expose a small command set from `apps/catalog/package.json`:

- `dev`: start the browser catalog through the repository's normal Portless/Turbo
  conventions;
- `build`: produce the static browser catalog used by CI;
- `dev:native`: start one native Storybook Metro process without launching a target;
- `dev:ios`: start or connect the native catalog on iOS;
- `dev:android`: start or connect the native catalog on Android;
- `codegen`: regenerate the native story registry deterministically.

Do not require callers to understand Storybook config directories, WebSocket ports,
Metro entrypoint swapping, or generated registries. That implementation complexity
stays local to the catalog workspace.

Use non-conflicting defaults for the browser server, Metro, and Storybook's native
channel server. The native commands must support running iOS and Android concurrently
against one Metro process rather than starting competing bundlers.

## 4. Implement the browser catalog

Configure the browser implementation with Storybook's React/Vite framework:

- discover only browser stories under `src/web`;
- import `@init/ui/globals.css` once through the preview environment;
- configure light and dark theme selection without duplicating the package's theme
  implementation;
- include responsive viewport, accessibility, controls, and interaction support that
  is compatible with the selected Storybook version;
- preserve `@init/ui` subpath imports instead of reaching into another workspace's
  source tree;
- emit a deterministic static build suitable for CI and ordinary static hosting.

Start with a curated set of stories covering Button, one form control, one overlay or
menu, and one composed state. Do not create a story for every existing web component in
this plan.

## 5. Implement the native catalog

Create `.rnstorybook/main.ts`, `preview.tsx`, and `index.tsx` using the supported React
Native Storybook entrypoint. Treat `storybook.requires.ts` as generated code: never edit
it manually, regenerate it deterministically, and choose a repository policy that
keeps clean-checkout type checking reliable. Prefer committing the generated registry
if checks need it before code generation, consistent with other committed generated
application files.

Compose Expo and Metro with:

- the supported Storybook bundler wrapper and entrypoint swapping;
- Uniwind as the outermost Metro wrapper;
- a catalog-owned CSS entry that imports `@init/native-ui/globals.css` and scans native
  stories;
- automatic WebSocket configuration for synchronized devices;
- the Babel and React Compiler configuration required by the repository's Expo stack.

Configure global native decorators or adapters for the real shared requirements:

- safe-area context;
- gesture handling;
- portal hosting;
- light and dark themes;
- representative screen dimensions and backgrounds;
- navigation context only for stories that require it.

Give the Expo application distinct development identifiers for iOS and Android. Avoid
copying unrelated authentication, observability, environment, or production features
from `apps/mobile` merely to make the catalog look like a product application.

Components such as `LargeTitleHeader` that depend on Expo Router or a native navigation
screen require a real adapter at that seam. Prove one supported approach—a focused
navigation decorator or catalog host route—without making every story aware of routing.

## 6. Organize stories and shared scenarios

Use this initial structure:

```text
apps/catalog/src/
├── web/
│   ├── components/
│   └── patterns/
├── native/
│   ├── components/
│   ├── patterns/
│   └── globals.css
└── shared/
    ├── fixtures/
    └── scenarios/
```

Stories import public package exports. They must not import between application
workspaces or reach into private package files. Shared scenarios contain renderer-
neutral values and behavior; web and native story adapters decide how those values are
presented.

The representative story set should cover:

- variants and sizes;
- disabled, loading, and error states where applicable;
- empty and long content;
- light and dark themes;
- one interaction with observable state;
- one portal or overlay;
- one real iOS/Android implementation difference;
- one domain-backed scenario using `@init/core`.

## 7. Integrate template selection and documentation

Verify that the existing setup command discovers `apps/catalog` without catalog-
specific branching. Selecting it must retain `@init/ui`, `@init/native-ui`, and
`@init/core` through declared dependencies. Omitting it must remove the application
without leaving root scripts, dangling configuration, or Storybook dependencies in the
remaining packages.

Document:

- how to select the catalog in a scaffolded project;
- browser, iOS, Android, and simultaneous-device workflows;
- where stories and shared scenarios live;
- how to add a story without changing package dependencies;
- which generated native file must be regenerated;
- the difference between browser rendering, actual iOS rendering, and actual Android
  rendering.

## 8. Add verification and CI

The initial CI interface must include:

- deterministic native story-registry generation;
- TypeScript and lint checks for both renderer configurations;
- a static browser Storybook build;
- native Metro bundle smoke checks for iOS and Android when supported without simulator
  infrastructure;
- a clean-tree assertion after code generation when the registry is committed.

Keep simulator-driven visual regression outside this plan. Record it as a possible
follow-up after the native catalog is stable and the repository has enough stories to
justify the operational cost.

Run the repository-required verification:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
bun run codegen
bun run build --filter=catalog
```

Also launch the catalog on an available iOS simulator and Android emulator at the same
time, select and update the same story, and record that both targets synchronize and
render their platform-specific implementation.

## Completion criteria

Plan 19 is complete when:

- `apps/catalog` is a selectable application workspace and is not selected by default;
- its small command interface starts the browser, iOS, and Android render targets;
- one Metro process serves synchronized iOS and Android catalogs;
- representative existing `@init/ui` and `@init/native-ui` stories render in light and
  dark themes;
- portal/provider and platform-specific behavior has a proven adapter;
- one `@init/core` scenario has separate web and native presentations;
- the static browser build and native bundle smoke checks pass;
- selecting or omitting the workspace produces a coherent scaffolded project;
- the ADR and architecture documentation describe the final implementation;
- no React Native Reusables registry expansion has been folded into this plan.
