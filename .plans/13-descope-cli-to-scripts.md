# 13 — Descope: delete the CLI, return to template scripts

**Status:** Completed
**Size:** M
**Depends on:** —
**Supersedes:** 06 (update rework), 08 (release automation), 11 (`bun create init-now`) — all
three deleted from `.plans/`; their only durable ideas (rename idempotency, CI smoke test)
are folded into this plan
**Affects:** 07 becomes local Turbo template recipes; 10 remains a standalone marketing
site with no code-distribution responsibility

## Decision

The published `init-now` CLI is overengineering for what this template needs. The
versioning/publishing problems (plan 08) and template-sync complexity (plan 06) only
exist because the CLI is a separately published npm package. We are reverting to the
pre-`7c1b5d31` design that already worked: plain scripts inside the template, run with
`bun run`.

Supported operations after this plan:

| Need            | Solution                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| create          | `bun create metaideas/init` (GitHub tarball, no npm package)                                                            |
| setup           | `bun template setup` — pick workspaces, set name/scope, cleanup                                                         |
| rename          | `bun template rename` — rewrite `@init/` scope and project name                                                         |
| add app/package | `bun template add` — wraps `turbo gen workspace --copy <github-url>`, then runs the rename pass on the copied workspace |
| check/update    | **Not supported.** Agents diff against upstream using the stamped commit (see below)                                    |

Constraints:

- Leverage Bun APIs (`Bun.file`, `Bun.Glob`, `Bun.spawn`, `Bun.$`) for all file/process work.
- Dependencies kept to a minimum: `yargs` for the command surface, `consola` for
  prompts + logging (matching the old `scripts/template` setup at `2de75496`..`08e6ec3b`),
  and `faultier` for structured errors (dogfooding a metaideas library; `tryharder` was
  considered and rejected as overkill for these scripts). Nothing else — no Effect, no
  clack, no octokit, no giget, no semver.
- Setup and rename logic is **rewritten from scratch**, not ported from `cli/`. The old
  Effect code is sunk cost; the new scripts should be much simpler. `cli/src/commands/`
  may be consulted for behavior reference only.

## Work items

### 1. Delete the CLI and deprecate the npm package

- Delete `cli/` entirely (source, tests, lockfile, bin).
- Delete `.github/workflows/cli.yml`.
- Run `npm deprecate init-now "init is now a GitHub template — use: bun create metaideas/init"`.
- Remove the `init-now` devDependency from root `package.json`.

### 2. Kill release-please and template versioning

- Delete `release-please-config.json`, `.template-version.json`, and
  `.github/workflows/release.yml`.
- Remove the `release-please` branch ignore from `.github/workflows/tests.yml` and the
  `release-please-config.json` reference in root `package.json`.
- Delete `CHANGELOG.md`; release history remains available in Git history.

### 3. Template stamp for agent-driven updates

Since `check`/`update` are gone, projects need a way to know what template snapshot they
started from so users can point agents at "diff `metaideas/init` from `<sha>` to `HEAD`
and apply what's relevant."

- `template setup` writes `.template.json` at the project root:

  ```json
  {
    "template": "metaideas/init",
    "commit": "<sha>",
    "createdAt": "<iso date>"
  }
  ```

- The sha is fetched at setup time from
  `https://api.github.com/repos/metaideas/init/commits/main` (the tarball `bun create`
  downloads is HEAD of main, so this matches modulo a negligible race). If the request
  fails (offline), write the file without `commit` and warn.
- Document the agent-update workflow in the README: point your agent at the upstream
  repo and the stamped commit; it cherry-picks what applies. Include two gotchas the
  agent must handle: upstream **deletions** should propagate, and the project rename
  must be normalized before diffing (local `@<scope>/` corresponds to upstream
  `@init/`) so renames don't read as edits.

### 4. Write the scripts

New `scripts/` folder at the repo root (excluded from workspace packages), mirroring
the structure that worked before (`2de75496`):

```
scripts/
  index.ts            # yargs root — project-owned scripts entry, extensible by users
  template/
    index.ts          # `template` command group registering the subcommands
    setup.ts
    rename.ts
    add.ts
    utils.ts          # shared helpers if needed; keep it flat
```

- `template setup` — interactive: select apps/packages to keep (delete the rest),
  set project name and npm scope (delegates to the rename logic), write
  `.template.json`, optional git init + `bun install`, self-cleanup of template-only
  files (`.plans/`, this script's own create-time artifacts, etc.).
- `template rename` — rename project and rewrite `@init/` scope across the repo
  (package.json names/deps, imports, config references). Must be runnable standalone
  and scoped to a single workspace (so `add` can invoke it on just the copied package).
  **Rename must be idempotent**: running it twice is a no-op, and after renaming (or
  adding a workspace to a renamed project) zero `@init/` references remain. No unit
  tests for the scripts (decided) — the CI smoke test is the safety net.
- `template add app <name>` / `template add package <name>`: shell out to
  `turbo gen workspace --copy https://github.com/metaideas/init/tree/main/<apps|packages>/<name>`,
  then run the rename pass on the copied workspace so `@init/` becomes the project scope.
- Root `package.json` scripts: replace the `init:*` entries with the old two-script
  setup:

  ```json
  "scripts": "bun run scripts/index.ts",
  "template": "bun --bun run scripts/index.ts template"
  ```

  Usage: `bun template setup`, `bun template rename`, `bun template add package <name>`.
  The generic `scripts` entry stays as the extension point for users' own project
  scripts (the yargs root's help text should say so).

### 5. `bun create` support

- Verify the repo is public at `metaideas/init` and `bun create metaideas/init <name>`
  works end to end.
- Add a `"bun-create"` section to root `package.json` that prints the next step (run
  `bun template setup`) after install — or runs it directly if the interactive prompts work
  under `bun create`'s postinstall (verify; if not, print instructions).
- Add a CI smoke test (in `tests.yml` or a small dedicated workflow): scaffold a
  project from the repo tarball, run `template setup` non-interactively (flags or
  env for answers), and assert the result — workspaces pruned, scope renamed, no
  `@init/` references, `.template.json` stamped.

### 6. Docs and plan bookkeeping

- Rewrite `README.md` quick-start: `bun create metaideas/init`, then `bun template setup`.
  Replace the `init-now` command table with the new scripts.
- Rewrite or delete `docs/template-commands.md` accordingly.
- `.plans/TRACKER.md` bookkeeping is already done (statuses, context, verification).
- Plans 06, 08, 11 are superseded by this plan.
- Plan 10 (marketing site) survives but should market the template/`bun create` flow,
  not an npm package.
- Plan 07 survives as snapshot-matched Turbo template recipes stored in the scaffold
  itself. It reuses the existing `bun generate` command surface and does not introduce
  a hosted catalog, shadcn format, or independently versioned installer.
- Plan 10 markets the GitHub template and `bun create metaideas/init` flow only; it
  does not host recipe artifacts.

## Verification

```sh
bun run format
bun run check
bun run analyze
bun run check:monorepo
bun test
```

Manual:

- `bun create metaideas/init test-proj` in a temp dir, run `bun template setup`, confirm
  workspace selection, rename, and `.template.json` stamp.
- `bun template add package <name>` in the scaffolded project copies and rescopes correctly.
- `npm view init-now` shows the deprecation notice.

## Out of scope

- Any form of automated `update`/`check`.
- Publishing anything to npm.
- The local template recipe catalog and shared generator installer (plan 07).
