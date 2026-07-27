# Plan 04 — CLI manifest & setup rework

Replace the hardcoded, drifted workspace list in `cli/src/workspaces.ts` with a **generated manifest**, add transitive dependency resolution to `init-now setup`, introduce an explicit backend choice, and support non-interactive use.

Prereqs: plan 01 (correctness fixes), plan 02 (final package set), and plan 09 (Effect v4 + adamantite + service structure) should land first — write this feature work against the v4 APIs and the `lib/services` structure plan 09 introduces.

## Problem summary

- `cli/src/workspaces.ts` is a handwritten `as const` list of apps/packages with dependency arrays. It has already drifted from reality (~12 packages list wrong `@init/*` deps), and the package-level `dependencies` arrays are never read by any code.
- `setup` (`cli/src/commands/setup.ts:137-171`) resolves app→package dependencies only one level deep. Concrete failure: selecting the `api` app keeps `db` but drops packages `db` itself depends on → dangling `workspace:*` deps → broken install.
- The CLI test (`cli/src/__tests__/workspaces.test.ts`) validates apps only — exactly not where the drift is.
- Everything is prompt-driven; unusable in CI.

## 1. Generated manifest

Create a generator (suggested: `cli/scripts/generate-manifest.ts`, runnable via `bun run --cwd cli generate:manifest`) that walks the template's `apps/*/package.json`, `packages/*/package.json`, `tooling/*/package.json` and emits `manifest.json` at the repo root containing, per workspace:

- `name` (npm name), `dir` (e.g. `packages/db`), `type` (`app` | `package` | `tooling`)
- `description` (from package.json `description` — add descriptions to workspace package.jsons where missing, migrating the prose currently in `workspaces.ts`)
- `dependencies`: `@init/*` / `@tooling/*` workspace deps (runtime + dev, flagged separately)
- template metadata that today lives in hardcoded CLI lists: files/dirs that are template-internal (the `cleanupInternalFiles` list from `setup.ts:95-110`, `EXCLUDED_DIRS` from `utils.ts:163-180`) — a single `internalPaths` array in the manifest so setup/update share one source of truth (update uses it in plan 06).

Wiring:

- Commit `manifest.json`; add a CI check (in `adamantite.yml` or `tests.yml`) that regenerates and diffs it, failing when stale. This replaces the drift-prone test.
- The CLI reads the manifest from the _downloaded/cloned template tree_ at runtime (giget result for create/setup, clone for update) — never from a bundled copy — so a published CLI always matches the template snapshot it's operating on.
- Compatibility check (enabled by lockstep versioning, plan 08): after fetching a template snapshot, compare the CLI's own version against the snapshot's version and warn on **major** mismatch, suggesting `bunx init-now@latest`. Guards stale globally-installed CLIs against manifest/layout changes.
- Delete `cli/src/workspaces.ts` and its test; add tests for the manifest reader + resolver instead.

## 2. Setup: transitive resolution + backend choice

Rework `cli/src/commands/setup.ts`:

1. **Backend choice prompt** (before app selection): `Hono API (apps/api)` / `Convex (packages/backend)` / `none`. Consequences:
   - Hono → keep `apps/api`; `packages/backend` deleted.
   - Convex → keep `packages/backend`; `apps/api` deleted. Warn that `apps/app` currently requires `api` (hard-imports `api/client`) — deselect/flag `app` accordingly (encode this as a manifest field, e.g. `requires: ["api"]`).
   - none → both deleted, same warning.
2. **App multiselect** (excluding whichever backend workspaces the choice already settled).
3. **Package preselection via transitive closure**: from selected apps' workspace deps, walk package→package deps to a fixpoint. Preselected-by-dependency packages should be shown but not deselectable (or deselecting them deselects dependents — pick the simpler UX: locked).
4. **Optional extras multiselect** for packages nothing selected depends on (payments, ai, analytics, ...).
5. **Post-prune validation**: after deleting unselected workspaces, scan remaining `package.json`s for `workspace:*` deps pointing at deleted workspaces and `rg`-style scan for `@init/<deleted>` imports. Fail loudly with the list, before `bun install`.
6. Use the shared `internalPaths` from the manifest for cleanup instead of the hardcoded list.

## 2b. Create-time version pinning

The root create command (`cli/src/index.ts:76`) downloads `github:metaideas/init` — the tip of `main` — so scaffolded projects can contain unreleased content while `.template-version.json` records the last release cut on `main`. Fix:

- Default the create command to the **latest release tag**: resolve it via the existing `getLatestRelease` logic and pass it as giget's ref (`github:metaideas/init#<tag>`). Fall back to `main` with a printed warning if the release lookup fails (offline/rate-limited).
- Add `--ref <tag|branch>` to override (mirrors plan 06's update flag).
- `setup` stamps `.template-version.json` with the version actually scaffolded (bare semver, per plan 01's format fix) instead of trusting the committed value.

## 3. Non-interactive mode

Add flags to `setup` (and the root create command where relevant): `--name <name>`, `--backend <api|convex|none>`, `--apps <a,b>`, `--packages <a,b>`, `--yes` (accept defaults, skip confirmations), `--no-install`, `--no-git`. Every prompt must have a flag equivalent. Validate flag values against the manifest and fail with the list of valid names.

## 4. `add` command alignment

`cli/src/commands/add.ts` currently offers workspaces from the hardcoded list and copies from `main`. Update it to:

- Read available workspaces from the manifest (fetched from the template at the project's recorded version — see plan 06's ref-pinning; until then, `main` with a warning).
- After copying: rewrite `@init/*` → project scope if the project was renamed (reuse `replaceProjectNameInProjectFiles`, scoped to the new workspace dir), add the workspace's own missing workspace-deps (transitive closure again — offer to add them), and run `bun install`.
- Make `add app` and `add package` consistent (both should handle scope prefixing and `--destination` the same way).

## Acceptance criteria

- `manifest.json` generated, committed, CI-checked for staleness; `cli/src/workspaces.ts` deleted.
- Scaffolding with only `api` selected produces a project where `bun install && bun run check` passes (transitive closure kept `db`'s deps).
- `init-now setup --yes --backend api --apps app --name demo` completes with zero prompts.
- Choosing Convex backend produces a project with `packages/backend`, no `apps/api`, and no dangling references.
- `cd cli && bun test` covers: manifest parsing, transitive resolution (including the api→db dependency closure), backend-choice pruning, flag validation.
