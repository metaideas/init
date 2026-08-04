# Plan 20 — Expand native UI with React Native Reusables

**Status:** Gated by Plan 19
**Size:** L

Expand `@init/native-ui` toward the complete React Native Reusables component set after
Plan 19 provides a reliable browser/iOS/Android catalog. Treat React Native Reusables
as copy-owned source and a continuing upstream reference, not as a runtime component
library. Adapt each addition to init's package exports, Uniwind setup, TypeScript style,
dependency constraints, and supported Expo platforms.

Do not start with a bulk `--all` import. The goal is a coherent native UI package with
verified behavior, not a snapshot whose dependencies compile only in the upstream
showcase. Every accepted batch must be usable through public `@init/native-ui`
subpaths, demonstrated in `apps/catalog`, and checked on actual iOS and Android
runtimes.

## Gate from Plan 19

Begin this plan only after Plan 19 proves:

- the native catalog runs on iOS and Android from one Metro process;
- story selection and args synchronize across native targets;
- Uniwind, portals, gestures, safe areas, themes, and navigation adapters work;
- the browser catalog and native catalog coexist in one workspace without type or
  dependency conflicts;
- package consumers use public exports rather than private source imports;
- native story generation and bundle smoke checks are reproducible.

If Plan 19 records an unresolved limitation for overlays, navigation, animation, or
platform-specific modules, resolve it before importing the affected component family.

## 1. Record source ownership and upstream policy

Add an upstream template decision or supporting research document that records:

- the exact React Native Reusables release or commit used for the initial inventory;
- its MIT license and the attribution retained in the repository;
- that imported files become source owned and editable by the scaffolded project;
- which parts are copied directly, adapted, omitted, or already represented locally;
- how future upstream changes are reviewed without overwriting local behavior;
- whether the React Native Reusables CLI is a maintainer convenience, a supported
  scaffold-owner command, or only an inventory source.

Do not create an automated updater that force-overwrites `@init/native-ui`. Upstream
updates must produce an inspectable diff and preserve intentional local adaptations.

## 2. Build and classify the inventory

Capture the complete current registry before importing code. For each component or
block, record:

- upstream name and source location;
- required React Native, Expo, RN Primitives, Reanimated, icon, portal, form, and other
  dependencies;
- supported platforms and known platform-specific implementations;
- whether an equivalent already exists in `@init/native-ui`;
- whether it is a primitive, composite control, overlay, navigation module, or product
  block;
- required providers and runtime configuration;
- compatibility with the repository's Uniwind and Expo versions;
- planned public export path;
- disposition: adopt, adapt, merge, defer, or reject.

Keep product-specific sponsored blocks and authentication examples out of the package
unless they satisfy a general package responsibility. They may become template recipes
or catalog patterns instead of ongoing `@init/native-ui` exports.

Finish the inventory with a dependency graph and batch order. Components whose only
purpose is supporting another adopted component may be placed in the same batch; avoid
shipping unused foundations merely because they exist upstream.

## 3. Establish the adaptation contract

Before the first batch, define and apply one local contract:

- lowercase kebab-case source files and public `./components/*` exports;
- functional React components and `type` aliases;
- Uniwind rather than NativeWind;
- `cn` from `@init/utils/ui`;
- existing `TextClassContext`, Icon, theme token, and variant conventions where they
  remain coherent;
- Expo APIs and Reanimated for performance-sensitive animation;
- public props that preserve useful upstream familiarity without retaining accidental
  implementation details;
- accessible labels, roles, focus behavior, reduced-motion behavior, and disabled
  semantics on each supported platform;
- no imports from `apps/mobile`, `apps/catalog`, or another application workspace.

Decide how to reconcile an upstream component with an existing local implementation.
Prefer one deep module with a stable interface over keeping parallel `legacy`, `new`,
or `rnr` versions. Preserve a local implementation when it has required behavior that
the upstream source lacks; otherwise migrate callers and remove the duplicate.

Add or update a package-local registry configuration only if it can target
`packages/native-ui` deterministically with Uniwind. Keep the CLI configuration out of
application workspaces and verify that generated paths honor the package's `#` imports
and public export structure.

## 4. Import components in dependency-ordered batches

Use independently reviewable batches. The inventory determines exact membership, but
the expected progression is:

1. foundations such as Text, Icon, Button, Separator, and shared variant/context code;
2. form controls such as Input, Textarea, Checkbox, Switch, Radio Group, and Select;
3. content and feedback such as Card, Avatar, Badge, Skeleton, Progress, Alert, and
   Toast;
4. overlays such as Dialog, Alert Dialog, Popover, Tooltip, Sheet, and Drawer;
5. menus and command surfaces such as Dropdown Menu, Context Menu, Menubar, and Command;
6. navigation and larger composite controls;
7. general-purpose blocks that belong in the reusable package rather than a template
   recipe.

For every batch:

- import or merge source without overwriting unrelated local changes;
- add the minimum required package dependencies with Expo-compatible versions;
- update public exports and types;
- add or update catalog stories for every public module;
- verify light and dark themes;
- exercise important empty, disabled, loading, error, long-content, and interaction
  states;
- verify portals, gestures, animations, keyboard behavior, and safe areas when used;
- run on both iOS and Android, including platform-specific files;
- record intentional differences from upstream;
- remove superseded local code and dependencies in the same batch.

A batch is incomplete if it only type-checks. The catalog must demonstrate its public
interface and both native runtimes must exercise the behavior that justified the
component's dependencies.

## 5. Use the catalog as the verification seam

Keep all Storybook-specific code in `apps/catalog`. `@init/native-ui` owns runtime
modules, styles, exports, and ordinary package tests; the catalog owns stories,
fixtures, interactive scenarios, and renderer adapters.

Create a consistent story contract for adopted modules:

- one canonical story for normal usage;
- variants and sizes when exposed by the public interface;
- disabled, error, and loading states where meaningful;
- long and empty content;
- light and dark themes;
- interaction behavior through Storybook args/actions where supported;
- an explicit platform story when iOS and Android intentionally differ;
- a composed scenario for modules whose value appears only with related controls.

Do not duplicate upstream documentation verbatim. Write concise local stories that
explain the interface actually shipped by init after adaptation.

## 6. Test runtime behavior and package interfaces

Add focused `bun:test` coverage alongside package modules for behavior that can be
tested without a native renderer, including variant selection, pure helpers, controlled
state transitions, and regression cases found during adaptation. Do not replace actual
iOS and Android verification with snapshots of React element trees.

For each batch, verify:

- public subpath imports resolve from a clean consumer;
- TypeScript does not require private upstream types;
- package peer and runtime dependencies are classified correctly;
- native bundles contain only the required platform implementation;
- accessibility and keyboard behavior match the supported platform contract;
- dark mode and CSS variables resolve through the package's Uniwind entry;
- no component assumes an application-owned router, query client, authentication
  provider, or environment module unless its interface explicitly accepts an adapter.

Use the browser catalog only for `@init/ui` parity references or documentation. React
Native Web output is not evidence that an imported module works on iOS or Android.

## 7. Control dependency and template cost

After every batch, run dependency analysis and inspect the effect on scaffolded project
installation and native builds. Avoid moving optional heavyweight dependencies into
the package root when a component family can isolate them behind a subpath or template
recipe.

When a component requires a dependency with native configuration:

- prove Expo Go or development-build requirements explicitly;
- update `apps/mobile` and `apps/catalog` configuration only through supported package
  interfaces;
- document required prebuild or rebuild steps;
- verify iOS pods and Android Gradle integration where applicable;
- reconsider adoption if the dependency cost is disproportionate to the component's
  general value.

Do not keep a component solely to claim complete registry parity if it weakens the
template's default install, platform support, or maintenance profile. Record rejected
or deferred entries in the inventory so completeness remains an explicit decision.

## 8. Update documentation and scaffold guidance

Update `packages/native-ui/README.md` and relevant architecture documentation with:

- the package's supported component inventory;
- public import conventions;
- required providers and theme setup;
- how to add a component through the approved upstream-review workflow;
- how to verify it in `apps/catalog`;
- platform-specific caveats and development-build requirements;
- source attribution and the policy for reviewing upstream updates.

If scaffold owners should be able to add omitted React Native Reusables entries after
setup, provide a documented copy-own workflow or template command. Do not promise the
upstream CLI works directly against a renamed scaffold until that path has been tested.

## 9. Verify each batch and the complete inventory

Run the repository-required checks after each batch rather than deferring cleanup until
the end:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
bun run codegen
bun run build --filter=catalog
```

Also run targeted builds for every changed workspace and launch the affected stories on
both an iOS simulator and Android emulator. Components that require physical hardware
or unavailable native capabilities must have their unverified behavior recorded and
cannot be described as fully supported.

At the end, repeat the inventory against the pinned upstream reference. Every entry
must have a disposition, every adopted public module must have catalog coverage, and
the package dependency graph must be free of dependencies used only by rejected or
superseded code.

## Completion criteria

Plan 20 is complete when:

- every component in the pinned React Native Reusables inventory has an explicit
  adopt, adapt, merge, defer, or reject decision;
- every adopted module follows init's TypeScript, Uniwind, Expo, import, and export
  conventions;
- existing local implementations have been merged or retained intentionally rather
  than duplicated;
- every public adopted module has catalog stories and actual iOS/Android verification;
- required providers and native configuration are documented and exercised;
- upstream attribution and update policy are recorded;
- package dependencies and scaffold costs have been reviewed batch by batch;
- repository checks, targeted catalog builds, and the final dependency inventory pass;
- no Storybook dependency or application-specific code has leaked into
  `@init/native-ui`.
