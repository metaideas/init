# Oxc React Compiler support

Date: 2026-08-20

## Decision

Adopt the Oxc React Compiler integration in the `app` and `desktop` application
workspaces after a focused compatibility test. Keep the Expo compiler setup in the
`mobile` application workspace.

Do not make Oxc React Compiler the default for all scaffolded projects in the first
change. Oxc marks the feature as experimental. Its options and behavior can change.
Use one pull request for the Vite workspaces, and keep the Babel path easy to restore
until the verification work is complete.

## What Oxc released

Oxc announced React Compiler support for Oxc Transform and Oxlint on 2026-08-18.
The transform is in the optional `oxc-transform-react` package. The package uses the
Rust compiler that Oxc maintains in its repository. It runs on the Oxc AST and does
not use `babel-plugin-react-compiler`. Oxc reports a preliminary speed improvement of
more than 10 times compared with Babel. Treat this number as an Oxc benchmark, not as
a result for this template.

The first published binding was version 0.144.0. The current package version during
this research is 0.145.0. Oxc keeps the compiler in a separate package, so projects
that do not install it do not pay its binary-size cost.

Sources:

- [Oxc announcement](https://oxc.rs/blog/2026-08-18-react-compiler-support)
- [Oxc React Compiler guide](https://oxc.rs/docs/guide/usage/transformer/react-compiler)
- [`oxc-transform-react` source and package documentation](https://github.com/oxc-project/oxc/tree/main/napi/transform-react)

## Supported integration

`@vitejs/plugin-react` 6.1.0 adds the official integration for Vite 8. Install
`oxc-transform-react` and configure the React plugin as follows:

```ts
react({ compiler: true })
```

The plugin declares `oxc-transform-react` as an optional peer dependency. Version
6.1.0 expects `oxc-transform-react` 0.145.x and Vite 8. This repository already uses
Vite 8.1.5, but it uses `@vitejs/plugin-react` 6.0.4.

The direct transform API supports React targets 17, 18, and 19. React 17 and 18 need
`react-compiler-runtime`. React 19 contains the runtime. This repository uses React
19.2.3, so it does not need the separate runtime package. The dedicated transform
package uses React 19 as its default target.

The package requires Node `^20.19.0 || >=22.12.0`. The template requires Node 24 or
later, so this requirement does not block the update.

Sources:

- [Oxc Vite setup](https://oxc.rs/blog/2026-08-18-react-compiler-support#vite)
- [Official Vite integration pull request](https://github.com/vitejs/vite-plugin-react/pull/1419)
- [Oxc transform configuration](https://oxc.rs/docs/guide/usage/transformer/react-compiler#general-usage)

## Compiler constraints

The compiler must receive the original JSX. A transform that rewrites JSX first can
break compilation. Oxc names Emotion JSX transforms and Babel constant-element or
inline-element transforms as examples. Oxc runs React Compiler before TypeScript
removal, React Fast Refresh, and JSX transformation.

The transform skips files whose names contain `node_modules` by default. A
`reactCompiler.sources` allowlist replaces that default filter. Do not add an
allowlist unless a workspace must compile a dependency.

When code breaks the Rules of React, React Compiler skips the component or hook. It
does not optimize that code. Oxc identifies observable mutation patterns, including
MobX `observer()`, as one source of skipped compilation.

Sources:

- [Oxc transform order](https://oxc.rs/docs/guide/usage/transformer)
- [Oxc limitations and source filtering](https://oxc.rs/docs/guide/usage/transformer/react-compiler#when-the-react-compiler-wont-work)
- [React requirement for original source](https://react.dev/learn/react-compiler/installation#what-does-the-compiler-assume)

## Oxlint changes

Oxc also added separate React Compiler rules. The recommended rules are in the
`correctness` category when the React plugin is active. The old nursery rule,
`react/react-compiler`, is obsolete and must be removed if a configuration uses it.

The recommended `unsupported-syntax` rule is in the `restriction` category, not the
`correctness` category. The `config` and `gating` rules are not implemented. Oxlint
uses fixed compiler options and does not expose compiler gating. This repository uses
Oxlint 1.79.0 and Adamantite's React configuration. The implementation change must
inspect Adamantite's effective rules before it adds or duplicates rules locally.

Source: [Oxc React Compiler rule table](https://oxc.rs/blog/2026-08-18-react-compiler-support#oxlint)

## Repository impact

The `app` and `desktop` workspaces use the same Babel path:

```ts
react(),
babel({ presets: [reactCompilerPreset()] }),
```

They also install `@babel/core`, `@rolldown/plugin-babel`,
`@types/babel__core`, and `babel-plugin-react-compiler`. These dependencies appear to
exist only for React Compiler. The update can remove them after repository search and
build verification confirm that no other Babel transform uses them.

The `mobile` workspace enables `experiments.reactCompiler` in Expo configuration.
Expo owns that Babel integration. Oxc's released integration targets Vite 8 and does
not provide an Expo or Metro integration. Keep `babel-plugin-react-compiler` in the
mobile workspace.

## Astro update

Checked on 2026-08-23. Astro has not released Oxc React Compiler support.
`@astrojs/react` 6.0.4 is the latest release. It still depends on
`@vitejs/plugin-react` `^5.2.0`, while the Oxc integration starts in
`@vitejs/plugin-react` 6.1.0. The integration's public options still select only
`include`, `exclude`, and `babel` from the Vite React plugin options. Its source calls
`react({ include, exclude, babel })`; it does not pass the `compiler` option.

The `web` workspace uses `@astrojs/react` 6.0.1. Updating it to 6.0.4 would not enable
Oxc React Compiler. Astro has an open draft pull request for a first-class React
Compiler option, but that work targets `babel-plugin-react-compiler`, not
`oxc-transform-react`. Keep the `web` workspace unchanged until Astro publishes an
integration that passes `compiler: true` to `@vitejs/plugin-react` 6.1 or later.

Sources:

- [`@astrojs/react` 6.0.4 package metadata](https://github.com/withastro/astro/blob/%40astrojs/react%406.0.4/packages/integrations/react/package.json)
- [`@astrojs/react` 6.0.4 integration source](https://github.com/withastro/astro/blob/%40astrojs/react%406.0.4/packages/integrations/react/src/index.ts)
- [`@astrojs/react` changelog](https://github.com/withastro/astro/blob/main/packages/integrations/react/CHANGELOG.md)
- [Open Astro React Compiler pull request](https://github.com/withastro/astro/pull/14955)

## Update plan

1. Confirm the effective Adamantite React rules. Add the new Oxlint correctness rules
   only if Adamantite does not enable them. Decide separately whether to enable
   `react/unsupported-syntax` because the correctness category does not include it.
2. Upgrade `@vitejs/plugin-react` to 6.1 or later in `app` and `desktop`. Add a pinned,
   compatible `oxc-transform-react` version to both workspaces.
3. Replace `react()` plus the Babel compiler preset with
   `react({ compiler: true })` in both Vite configurations.
4. Remove `@babel/core`, `@rolldown/plugin-babel`, `@types/babel__core`, and
   `babel-plugin-react-compiler` from only the two Vite workspaces. Keep the mobile
   Babel dependencies and Expo configuration.
5. Run `bun install`, `bun run format`, `bun run analyze`,
   `bun run check:monorepo`, and `bun run check`.
6. Build `app` and `desktop`. Run their development servers and test React Fast
   Refresh, route changes, source maps, and production bundles.
7. Compare representative compiler output before and after the change. Include code
   with manual memoization, effects, refs, and shared UI package imports. Check that
   Oxc does not skip code that Babel compiled.
8. If verification finds a compiler difference, restore the Babel path and report a
   minimal case to Oxc. Do not add a broad source allowlist as a workaround.

## Acceptance criteria

- `app` and `desktop` build without the Babel React Compiler path.
- Their development servers keep Fast Refresh and useful source maps.
- Production behavior matches the current Babel builds for the selected test flows.
- `mobile` continues to use the Expo React Compiler integration.
- Oxlint reports React Compiler problems with no duplicate rule reports.
- The repository checks and dependency analysis pass.
