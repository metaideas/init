# Plan 06 — Update command rework

Make `init-now update` a safe, reviewable sync instead of a blind overwrite. Prereqs: plan 01 (version/tag fixes), plan 04 (manifest with `internalPaths`), and plan 09 (Effect v4 migration — implement against the v4 APIs and service layers).

## Current behavior and defects (`cli/src/commands/update.ts`)

Flow today: compare `.template-version.json` against the latest GitHub release → require clean working tree → `git clone --depth 1` of **`main`** into `.template-sync-tmp` → `git ls-files` both trees → copy template files over local files → `git add .` → stamp the **release tag** into `.template-version.json` → user reviews staged diff.

Defects:

1. **"Skip locally modified files" is dead code** (`update.ts:46-50`): `ShellCommand.exitCode` succeeds with the code, which is discarded; and since the tree is required clean, `git diff HEAD -- <file>` can never differ anyway. Every committed customization is overwritten. Docs claim otherwise (`docs/template-commands.md:69`).
2. **Version/content skew**: clones `main` but records the release tag.
3. **Rename not idempotent**: copied files reintroduce `@init/*` into renamed projects; the rename is never re-applied.
4. **Re-adds internal files** that `setup` deleted (`cli/`, `release-please-config.json`, `.github/workflows/release.yml`): they're "new" files not under `apps/*`/`packages/*`, so `filterNewFilesForExistingWorkspaces` (`update.ts:105-125`) lets them through.
5. **Deletions never propagate.**
6. Misc: handler regex-parses versions out of its own log message (`update.ts:248-255`); workspace listing shells out to `sh -c` (`update.ts:94-103`, non-portable); `git add .` stages everything.

## Target design

### 1. Sync from the tag it stamps

Clone the release tag (`git clone --branch <tag> --depth 1`), not `main`. `.template-version.json` then always matches content (bare semver, per plan 01 fix). Add `--ref <tag|branch>` to override for testing against `main`.

### 2. Base-aware three-way file classification

We know the project's last-synced version (the recorded base). Clone/fetch **both** the base tag and the target tag (or one clone + `git worktree`/`git show base:<file>`). For each template file, compare three contents — base, target, local:

| base vs target    | base vs local     | Action                                                                                                          |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| unchanged         | anything          | skip (nothing to update)                                                                                        |
| changed           | unchanged         | copy (clean update)                                                                                             |
| changed           | changed           | **conflict** — prompt per file: keep local / take template / write `<file>.template` alongside for manual merge |
| new in target     | absent locally    | add (respecting workspace filter)                                                                               |
| deleted in target | unchanged locally | delete                                                                                                          |
| deleted in target | changed locally   | prompt                                                                                                          |

Important: compare against the _rename-normalized_ local content — apply the project-name → `@init` reverse substitution (inverse of `replaceProjectNameInProjectFiles`, `cli/src/utils.ts:242-268`) before diffing, so a rename alone doesn't mark every file "locally changed".

### 3. Rename-aware application

After copying files, re-run the `@init` → `@<project>` rewrite scoped to the files that were just written (project name from root `package.json`).

### 4. Respect the manifest

- Skip everything in the manifest's `internalPaths` (plan 04) — never re-add `cli/`, release config, internal workflows, `.plans/`, etc.
- Keep the existing rule: new files under `apps/*`/`packages/*` only for workspaces present locally. Read workspace dirs with the `FileSystem` service, not `sh -c`.

### 5. UX and safety

- **CLI-only releases are no-ops** (consequence of lockstep versioning, plan 08): when the classification finds zero file changes between base and target, report "CLI-only release — nothing to sync", bump `.template-version.json` to the target, and exit cleanly. No staging, no conflict prompts.
- `--dry-run`: print the full classification table (add/update/delete/conflict/skip) and exit.
- Stage only files the command touched (explicit `git add <paths>`), plus `.template-version.json`.
- Show the changelog range: fetch release notes for every release between base and target (Octokit `listReleases`), not just the latest.
- Return structured data between steps (fix the regex re-parse).
- On any failure, ensure temp dirs are cleaned (already done via `Effect.ensuring` — preserve).

### 6. Docs

Update `docs/template-commands.md` to describe the real behavior (the "only updates unmodified files" claim becomes true with §2). Note `check` shares the version logic — deduplicate `checkVersionUpdates` between `check.ts` and `update.ts` into a shared module.

## Testing

`cd cli && bun test` with fixture-based tests (two small fake git repos as base/target/local):

- clean update, local-modification conflict, upstream deletion, renamed-project idempotency (run update twice — second run is a no-op), internal-path exclusion, `--dry-run` output.

## Acceptance criteria

- Updating a renamed project introduces zero `@init/` references.
- A file customized-and-committed locally is never silently overwritten — it surfaces as a conflict.
- Files deleted upstream are deleted (or prompted) locally.
- `cli/`, `release-please-config.json`, `.github/workflows/release.yml` never reappear in user projects.
- `.template-version.json` always equals the tag content that was synced.
- `--dry-run` makes no writes.
