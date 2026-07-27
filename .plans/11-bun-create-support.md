# Plan 11 — `bun create init-now` support

Make `bun create init-now my-app` (and `npm create init-now` / `yarn create init-now` / `pnpm create init-now`) work as the canonical scaffold command. Decided: the marketing page (plan 10) ships with `bunx init-now@latest` and switches to `bun create init-now` once this lands.

Prereqs: plan 08 (CLI release automation) — this plan extends its publish pipeline. Plan 09's restructure should also be in place so this is built on the final CLI architecture.

## How `bun create` resolves

`bun create <name> <dir>` (and the npm/yarn/pnpm `create` equivalents) resolves the npm package **`create-<name>`** and runs its `bin`. So this requires publishing a package named **`create-init-now`**.

## 1. The `create-init-now` package

Keep it a **thin wrapper** — no logic duplication:

- New directory `cli/create/` (or `create-init-now/` sibling to `cli/` — pick whichever keeps release-please path config simplest; it is template-internal either way).
- `package.json`: name `create-init-now`, a single `bin` entry, `dependencies: { "init-now": "<version>" }`.
- The bin simply delegates to the `init-now` root command (scaffold flow), forwarding argv: `import "init-now/dist/index.js"`-style shim or spawning the resolved bin. Verify `init-now`'s package exports allow programmatic/bin reuse; add an export if needed.
- No own build step if possible (plain JS shim); no own lockfile ceremony beyond what publishing requires.

Version strategy: `create-init-now` joins the **lockstep version group** from plan 08 (`init` + `init-now` + `create-init-now` share one version via release-please's `linked-versions` plugin), with its `init-now` dependency pinned to that same version. A small release-workflow step (or the release PR itself) syncs the dependency pin each release.

## 2. Release automation (extends plan 08)

- Add `create-init-now` to `release-please-config.json` (own component/tag) or, simpler, publish it from the same workflow step that publishes `init-now`, with its version + dependency synced to the CLI version programmatically before `npm publish`. Prefer whichever needs less config to keep in lockstep — evaluate both, document the choice in `cli/README.md`.
- Publish gate: same as `init-now` (tests + build green).
- Smoke test in CI (can live in the CLI workflow from plan 09): `bun create init-now@latest tmp-app` against the freshly packed tarballs (`bun pm pack` + install from file) asserting the scaffold flow starts (e.g., `--help`/`--version` of the shim resolves and prints).

## 3. Template-internal hygiene

- The wrapper directory joins the internal-files story: `cleanupInternalFiles` in `cli/src/commands/setup.ts`, plan 04's manifest `internalPaths`, and the cleanup-list test from plan 09 §5. (If it lives under `cli/`, it is already covered by the existing `cli` entry — verify.)
- Update docs after landing: `cli/README.md` and the root `README.md` getting-started section switch the canonical command to `bun create init-now my-app` (keep `bunx init-now@latest` documented as equivalent).
- Update the marketing page command (plan 10 site) in the same PR.

## Acceptance criteria

- `bun create init-now my-app` scaffolds a project identically to `bunx init-now@latest my-app` (same prompts, same output).
- `npm create init-now@latest my-app` works (verifies the cross-package-manager path).
- Publishing is automated: a CLI release produces matching `init-now` and `create-init-now` versions on npm with the wrapper depending on the exact released version.
- Scaffolded projects contain no trace of the wrapper package.
- Marketing page and READMEs show `bun create init-now my-app` as the primary command.
