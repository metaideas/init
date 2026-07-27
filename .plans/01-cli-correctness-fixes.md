# Plan 01 — CLI correctness fixes

Small, independent bug fixes in `cli/` (the `init-now` CLI). No feature work — that is plan 04/06. The CLI is an Effect-based app (`@effect/cli`), bundled with bunup, published to npm. It has its own `bun.lock` and tests (`cd cli && bun test`).

## Bugs to fix

### 1. Scaffold overwrite is broken

`cli/src/index.ts:64-73`: the root command prompts "directory exists, overwrite?" but never clears the directory nor passes `force: true` to giget's `downloadTemplate` (`cli/src/index.ts:76`). giget throws when the target dir is non-empty, so answering "yes" produces a `DownloadFailed` error.

Fix: on confirmed overwrite, pass `force: true` (or `forceClean: true` if full replacement is desired — check giget docs) to `downloadTemplate`.

### 2. Wrong `--version` output

`cli/src/index.ts:113` hardcodes `"2.0.0"` in `Command.run` while `cli/package.json` says `2.0.2`. Read the version from `cli/package.json` at build time (bunup define/macro) or import it, so there is a single source of truth. (Plan 09 formalizes this as a Bun macro following `../adamantite/src/lib/shared/version.macro.ts` — a plain JSON import is fine here if 09 hasn't landed.)

### 3. `compareVersions` breaks on the actual tag format

Release tags are `init@v1.1.0` (release-please config: `tag-separator: "@"`, `include-component-in-tag: true` in `release-please-config.json`). `compareVersions` (`cli/src/utils.ts:126-146`) only strips a leading `v`, so `"init@v1.1.0".split(".")` yields `[NaN, 1, 0]` — NaN comparisons silently return equal, and the major version is ignored.

Fix: normalize tags by stripping the `<component>@v` prefix (regex like `/^.*@v?/`) before comparing. Also make non-numeric segments an explicit error or treat the version as unknown instead of silently comparing NaN.

### 4. `.template-version.json` format corruption

The file starts as `{".": "1.1.0"}` (it doubles as the release-please manifest). `updateTemplateVersion` (`cli/src/utils.ts:148-153`) writes the raw tag (`init@v1.1.0`) after an update, producing a format neither release-please nor `getVersion` (`utils.ts:83-101`) expects on the next run.

Fix: always store the bare semver (`1.1.0`). Normalize when writing AND when reading (defensive, for projects already corrupted).

### 5. `check` unreachable branch

`cli/src/commands/check.ts:24-27`: `if (!latestRelease)` is dead — `getLatestRelease` fails with `VersionCheckFailed` (handled via `catchTag` at `check.ts:59`), it never succeeds with `null`. Delete the branch.

### 6. Duplicated `updatePackageJson`

`cli/src/commands/setup.ts:42-52` does regex string-replacement on package.json (fragile: depends on exact `"name": "init"` formatting, rewrites first `"version"` match). `cli/src/commands/rename.ts:11-21` does it properly via JSON parse/serialize. Extract the JSON-based implementation into `cli/src/utils.ts` and use it in both.

### 7. Stale exclusion/cleanup lists

- `cli/src/utils.ts:175`: `EXCLUDED_DIRS` contains `"scripts/template"`, which no longer exists.
- `cli/src/commands/setup.ts:101`: `cleanupInternalFiles` removes a root `__tests__` dir that no longer exists, and misses newer internal files (`.github/workflows/opencode.yml`, `cli/.claude`, `.plans/`).

Fix: refresh both lists against the current template tree. (Plan 04 replaces these with a manifest — keep this fix minimal.)

### 8. Minor dead code

- `cli/src/utils.ts:78`: `export type ReleaseInfo` — unused, delete or stop exporting.
- `cli/src/commands/setup.ts:168`: `const packages = selectedPackages` pointless alias.

## Acceptance criteria

- `init-now <name>` into an existing non-empty dir with "overwrite: yes" succeeds.
- `init-now --version` prints the version from `cli/package.json`.
- `compareVersions("init@v2.0.0", "1.1.0")` reports an update available; add unit tests in `cli/src/__tests__/` covering tag formats: `1.1.0`, `v1.1.0`, `init@v1.1.0`.
- After a simulated update, `.template-version.json` contains `{".": "<bare semver>"}`.
- `cd cli && bun test` passes; `bun run check` at root passes.

## Out of scope

Manifest generation, setup/backend selection, update-command semantics (plans 04 and 06). npm publish automation (plan 08). Effect v4 migration, adamantite adoption, CLI CI (plan 09) — keep these fixes on the current Effect v3 APIs so they can land immediately.
