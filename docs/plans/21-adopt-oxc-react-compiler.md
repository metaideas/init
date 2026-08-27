# Plan 21: Adopt Oxc React Compiler support

**Status:** Vite phase implemented. Expo, Astro, and WXT phases wait for supported
integrations.
**Size:** M

Adopt Oxc React Compiler support in two parts. Use the new Oxlint rules first. Replace
the Babel compiler transform in the Vite application workspaces through the official
`@vitejs/plugin-react` integration.

Oxc marks the compiler transform as experimental. `@vitejs/plugin-react` 6.1.0 adds
the supported Vite 8 integration. Use that integration. A custom Vite plugin could run
the compiler after another JSX transform, which Oxc does not support. Do not add a
custom integration to the Template.

See `docs/research/oxc-react-compiler.md` for the source review and current Oxc
limits.

## Current workspace state

The application workspaces have these compiler paths:

| Application workspace | React build path                | Current compiler state                  | Planned action                                                               |
| --------------------- | ------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------- |
| `apps/app`            | Vite and `@vitejs/plugin-react` | Babel compiler enabled                  | Migrate to `react({ compiler: true })`.                                      |
| `apps/desktop`        | Electron Forge and Vite         | Babel compiler enabled for the renderer | Migrate with `apps/app`.                                                     |
| `apps/mobile`         | Expo and Metro                  | Expo enables the Babel compiler         | Keep the Expo-owned setup until Expo supports the Oxc transform.             |
| `apps/web`            | Astro React integration         | Compiler not enabled                    | Wait for Astro support. Do not add a separate transform.                     |
| `apps/extension`      | WXT React module                | Compiler not enabled                    | Wait for WXT support or an official Vite React integration that WXT exposes. |
| `apps/docs`           | Astro and Starlight             | No React application code               | No change.                                                                   |
| `apps/api`            | Bun and Hono                    | No React build                          | No change.                                                                   |

The current dependency update to Adamantite `0.37.0` and Oxlint `1.79.0` already
enables the new React Compiler lint rules through `adamantite/lint/react`. Preserve
that update. Do not add the removed `react/react-compiler` nursery rule.

## 1. Finish the lint update

Verify the current Adamantite and Oxlint update before any transform change:

1. Confirm that `oxlint.config.ts` extends `adamantite/lint/react`.
2. Run `bun run check` against all selected workspaces.
3. Fix React rule failures as code defects. Do not use broad rule suppressions.
4. Add a narrow suppression only when the diagnostic identifies a supported pattern
   that the compiler cannot optimize. Record the reason next to the suppression.
5. Run the application tests and builds after a fix changes component behavior.

Adamantite enables the compiler correctness rules, selected suspicious rules, and
`react/no-deriving-state-in-effects`. It keeps compiler restriction rules off. Keep
this policy until an application workspace runs the Oxc transform and needs a stricter
rule.

## 2. Pin the supported Vite integration

Upgrade both Vite application workspaces from `@vitejs/plugin-react` 6.0.4 to 6.1.0 or
a later compatible stable version. Add `oxc-transform-react` 0.145.x, which is the
optional peer dependency for version 6.1.0. Keep the versions aligned in `apps/app`
and `apps/desktop`.

The Template already uses Vite 8.1.5, React 19.2.3, and Node 24 or later. These
versions meet the documented requirements. React 19 contains the compiler runtime, so
do not add `react-compiler-runtime`.

## 3. Migrate the Vite application workspaces

Migrate `apps/app` first. It is the smallest direct test of TanStack Start, server
rendering, client hydration, and React Fast Refresh.

1. Replace `react()` and the Babel compiler preset with `react({ compiler: true })`.
2. Keep the default React 19 target. Set it explicitly only if verification finds that
   the plugin does not use the documented default.
3. Remove `@babel/core`, `@types/babel__core`, `@rolldown/plugin-babel`, and
   `babel-plugin-react-compiler` from `apps/app` if no other transform uses them.
4. Build the server and browser bundles.
5. Test development Fast Refresh, route changes, server functions, hydration, and
   production startup.
6. Compare a representative transformed component before and after the change. Confirm
   that Oxc inserts compiler memoization and produces a valid source map.

After `apps/app` passes, apply the same change to the renderer in `apps/desktop`.
Do not change the Electron main or preload builds because they do not compile React.
Package the desktop application and test a production renderer in addition to the
development server.

Keep the two migrations in separate commits. If the desktop integration finds an
Electron Forge problem, revert only the desktop commit and keep the verified
`apps/app` migration.

## 4. Keep Expo on its supported compiler path

`apps/mobile` enables `experiments.reactCompiler` in the Expo configuration. Keep this
setting and `babel-plugin-react-compiler` until Expo documents an Oxc React Compiler
path for Metro.

When Expo adds support:

1. Follow the Expo integration instead of calling `oxc-transform-react` from a custom
   Metro transformer.
2. Preserve the Varlock Babel plugin unless its owner supplies an Oxc replacement.
3. Verify that Uniwind, Sentry, Expo Router, and React Native Reanimated still receive
   the transforms that they require.
4. Test development refresh, an Android build, an iOS build, and a static web export.
5. Remove `babel-plugin-react-compiler` only when the resolved Babel configuration no
   longer loads it.

The mobile migration has a separate release gate from the Vite migration. Do not delay
the verified Vite work while Expo still needs Babel.

## 5. Evaluate the remaining React application workspaces

Do not enable the compiler in `apps/web` or `apps/extension` through an extra transform
layer. Their framework integrations own JSX transformation and refresh behavior.

For `apps/web`, wait for `@astrojs/react` to document Oxc React Compiler support. Test
Astro islands, client directives, static output, and MDX components before adoption.

For `apps/extension`, first determine whether `@wxt-dev/module-react` exposes the
`@vitejs/plugin-react` compiler option. If it does not, wait for WXT support. Test the
popup, content scripts, background development reloads, Chrome builds, and Firefox
builds before adoption.

If either framework chooses not to expose Oxc support, record that limit. A mixed
compiler setup is preferable to an unsupported transform order.

## 6. Remove Babel dependencies when the last consumer leaves

After each migration, use `rg` and dependency analysis to find remaining Babel users.
Remove a dependency only from the workspace that no longer uses it. Do not remove a
root lockfile entry by hand.

When no application workspace uses the Babel React Compiler, remove the final
`babel-plugin-react-compiler` dependency and its related Babel packages. Run the
monorepo consistency check after the dependency changes.

## Verification

Run the repository checks for each implementation pull request:

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

Also run the builds for each changed application workspace. For a transform migration,
test both development and production behavior. A successful type check does not prove
that React Fast Refresh, source maps, hydration, or compiler memoization work.

## Completion criteria

This plan is complete when all applicable conditions are true:

- Oxlint runs the new React Compiler rules without the removed nursery rule.
- `apps/app` and the `apps/desktop` renderer use the official Oxc integration from
  `@vitejs/plugin-react`.
- `apps/mobile` uses an Expo-supported Oxc path, or the repository records that Expo
  still requires Babel.
- `apps/web` and `apps/extension` use framework-supported Oxc paths, or the repository
  records the framework limits.
- No workspace keeps Babel compiler dependencies that it does not use.
- Development and production verification covers each migrated application workspace.
