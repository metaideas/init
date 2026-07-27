# Plan 09 — CLI: Effect v4 migration, adamantite tooling, and CI

Modernize the `init-now` CLI (`cli/`): migrate to Effect v4 beta, adopt adamantite for lint/format/typecheck, add a dedicated GitHub Actions workflow, and guarantee all of it is stripped from scaffolded projects.

**Reference implementation: `../adamantite`** (local checkout, `github.com/adelrodriguez/adamantite`). It is a standalone Effect v4 beta CLI with the exact target structure and tooling. When in doubt about v4 APIs or project layout, mirror what adamantite does.

Prereq: plan 01 (correctness fixes) — land first so behavior fixes aren't tangled with the migration. This plan subsumes plan 01 item 2 (version string) via the macro pattern below. Plans 04 and 06 should be written against the migrated codebase, so this plan precedes them.

## Context

- CLI today: `effect@3.19.14`, `@effect/cli@0.73.0`, `@effect/platform@0.94.1`, `@effect/platform-bun@0.87.0`. Bundled with bunup, bin shim at `cli/bin/init-now`, own `bun.lock` (NOT part of root workspaces).
- The CLI is currently excluded from all repo linting: root `oxlint.config.ts` ignores `cli/**` (tsgolint panics resolving the nested standalone tsconfig). So the CLI has no lint/format/typecheck enforcement at all today.
- adamantite (the reference) uses `effect@4.0.0-beta.99` + `@effect/platform-node@4.0.0-beta.99`. `@effect/platform-bun` also has `4.0.0-beta.*` releases — prefer it since the CLI targets Bun (`bunup.config.ts` target) — but if v4-beta platform-bun lags or misbehaves, `@effect/platform-node` works under Bun (adamantite proves this).

## 1. Migrate to Effect v4 beta

Dependency changes in `cli/package.json`:

- `effect` → `4.0.0-beta.x` (match adamantite's pinned beta or newer; pin exact).
- **Remove** `@effect/cli` and `@effect/platform` — in v4 these live inside `effect` itself: `effect/unstable/cli` (`Command`, `Flag`, `Argument`, `Prompt`), `effect/FileSystem`, `effect/Terminal`, `effect/unstable/process/ChildProcess` (replaces `@effect/platform` `Command`/shell execution).
- `@effect/platform-bun` → `4.0.0-beta.x` (`BunRuntime`/`BunServices`), or swap to `@effect/platform-node` (`NodeRuntime`/`NodeServices`) exactly as `../adamantite/src/index.ts` does.
- Keep `giget` and `@octokit/rest` external per `cli/bunup.config.ts`; update the `external` list (`effect` stays external, dropped packages removed).

API migration map (see adamantite for live examples of each):

| v3 (current CLI)                                      | v4 (adamantite pattern)                                                                     | Reference                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `import { Command, Prompt } from "@effect/cli"`       | `effect/unstable/cli/Command`, `.../Prompt`, `.../Flag`, `.../Argument` (namespace imports) | `../adamantite/src/commands/*.ts`               |
| `@effect/platform` `Command` (shell)                  | `effect/unstable/process/ChildProcess` + `ChildProcessSpawner`                              | `../adamantite/src/lib/shared/process.ts`       |
| `@effect/platform` `FileSystem`                       | `effect/FileSystem` (interface moved into core)                                             | `../adamantite/src/lib/shared/filesystem.ts`    |
| `BunContext.layer` / `BunRuntime.runMain`             | `BunServices`/`NodeServices` layer + `Runtime`/`NodeRuntime` main                           | `../adamantite/src/index.ts`                    |
| `Data.TaggedError` tagged errors (`cli/src/utils.ts`) | same concept; check `Data`/`Schema` error patterns                                          | `../adamantite/src/lib/shared/errors.ts`        |
| Hardcoded version string in `Command.run`             | build-time macro: `getPackageVersion()` `with { type: "macro" }`                            | `../adamantite/src/lib/shared/version.macro.ts` |

Migration is command-by-command: `index.ts` (root create), `commands/{setup,add,check,rename,update}.ts`, `utils.ts`. Behavior must not change — the existing tests in `cli/src/__tests__/` (plus any added by plan 01) are the regression net; extend them where coverage is thin before migrating a command.

## 2. Restructure to match adamantite's layout

Target structure (mirror `../adamantite/src`):

```
cli/src/
  index.ts              # Command.make + withSubcommands + runtime bootstrap
  commands/             # one file per subcommand (+ commands/__tests__/)
  lib/
    services/           # Context.Tag services (command runner, prompter, ...)
    shared/             # errors.ts, filesystem.ts, process.ts, version.macro.ts
  __tests__/
```

- Split the current `cli/src/utils.ts` grab-bag into `lib/shared/*` modules (errors, version/release lookup, file walking, project-name rewriting).
- Adopt `#` subpath imports (`"imports": { "#*": "./src/*" }` in `cli/package.json`), matching both adamantite and this repo's own convention.
- Wrap shell/prompt side effects in `Context.Tag` services (see `../adamantite/src/lib/services/command-runner.ts`, `prompter.ts`) so command logic is testable with stub layers — this directly benefits plans 04/06 test requirements.

## 3. Adamantite support for the CLI

The CLI stays outside root workspaces (own lockfile, published independently), so it gets its **own** adamantite setup, like the adamantite repo itself:

- Add `adamantite` (+ `oxlint`, `oxfmt`, `knip` as its presets require — copy adamantite's own devDependencies approach) to `cli/package.json` devDependencies.
- `cli/oxlint.config.ts` and `cli/oxfmt.config.ts` extending `adamantite/lint` + `adamantite/lint/node` and `adamantite/format` (see the repo root configs for consumer syntax; drop the react preset).
- `cli/knip.config.ts` if adamantite's analyze needs it (root `knip.config.ts` already has a `cli` workspace entry — decide whether cli analysis moves fully local; prefer local so `cd cli && bun run analyze` is self-contained, and slim the root entry).
- Scripts in `cli/package.json`: `check`, `format`, `fix`, `analyze` → `adamantite <cmd>`, plus existing `build`/`test`.
- Root `oxlint.config.ts`: keep the `cli/**` ignore (the CLI now enforces itself), but update the comment to say the CLI runs its own adamantite setup.
- Run `bun run fix` + `bun run format` inside `cli/` and resolve the initial wave of lint findings (expect real findings — this code has never been linted).

## 4. GitHub Actions for the CLI

Add `.github/workflows/cli.yml`, modeled on `../adamantite/.github/workflows/ci.yml`:

- Trigger: `pull_request` and `push` to `main`, **filtered to `paths: [cli/**, .github/workflows/cli.yml]`** so template-only PRs don't pay the cost.
- Matrix jobs, all with `workdir`/`defaults.run.working-directory: cli`: `check` (adamantite), `format --check`, `test` (`bun test`), `analyze`, `build` (bunup + verify `bin/init-now` runs `dist/index.js --version` successfully as a smoke test).
- Setup: checkout, setup-bun, cache keyed on `cli/bun.lock`, `bun install --frozen-lockfile` in `cli/`.
- Plan 08 (release automation) note: its publish gate should reuse/require this workflow's jobs rather than duplicating test/build steps.

## 4b. Robustness fixes (ride along with the restructure)

Address these while touching the affected modules — they're behavioral hardening, not features:

- **Stop swallowing errors**: the codebase leans on `Effect.orElse(() => Effect.void)` / broad `catchAll` (`setup.ts:37,76,107`, `update.ts:84,88,211,218`, `utils.ts:101,153`), so partial failures still print "✅". With the v4 service structure, make failures explicit: either propagate, or downgrade to a printed warning — never silent success.
- **Input validation**: `rename` accepts any string; apply the same name regex the create command uses (`index.ts:14`), npm-scope-safe. `setup`'s name prompt likewise.
- **Tool preflight checks**: verify `git` (setup/update) and `turbo` (add) exist on PATH before starting, with actionable error messages.
- **GitHub rate limits**: unauthenticated Octokit calls get 60 req/h/IP; on 403-rate-limit, print a clear message (optionally honor `GITHUB_TOKEN` env if present) instead of a generic `VersionCheckFailed`.

## 5. Cleanup in scaffolded projects

`init-now setup` already deletes `cli/` (`cleanupInternalFiles`, `cli/src/commands/setup.ts:95-110`). Extend the guarantee:

- Add `.github/workflows/cli.yml` to the cleanup list (and `.github/workflows/release.yml` / `release-please-config.json` if not already covered — verify against the current list).
- When plan 04 lands, these paths move into the manifest's `internalPaths` — ensure `cli/` and its workflow are in that list so `update` (plan 06) never re-adds them either.
- Add a CLI test asserting the cleanup list covers: `cli/`, `.github/workflows/cli.yml`, `.github/workflows/release.yml`, `release-please-config.json`, `.plans/`. This is the regression net for "internal files leak into user projects".

## Acceptance criteria

- `cli/package.json` depends on `effect@4.0.0-beta.x` only (no `@effect/cli`, no `@effect/platform`); `cd cli && bun test` green; all commands behave identically (manual smoke: create → setup → check in a temp dir).
- `cd cli && bun run check && bun run format --check && bun run analyze && bun run build` all pass.
- `init-now --version` matches `cli/package.json` (macro-inlined, no hardcoded string).
- `.github/workflows/cli.yml` runs and passes on a PR touching `cli/`; does not trigger on template-only changes.
- A scaffolded project contains no `cli/` directory and no `.github/workflows/cli.yml` (covered by an automated test).

## Risks / notes

- Effect v4 is beta: pin exact versions, and expect `unstable/cli` API movement between betas — upgrading betas later is a `bump:deps` + fix cycle, acceptable for an internal tool.
- Do the restructure (§2) and migration (§1) as one PR series but separate commits: move files first (no logic change), then migrate imports/APIs — keeps diffs reviewable.
- If tsgolint/oxlint type-aware checks still panic on the standalone package, check how adamantite configures `typeAware`/`typeCheck` options in its own `oxlint.config.ts` and mirror it.
