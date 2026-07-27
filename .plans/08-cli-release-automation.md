# Plan 08 — CLI release automation

Automate versioning and npm publishing for the `init-now` CLI (`cli/`), ending version drift. Land after plan 01 (hardcoded banner version fix) and plan 09 (CLI CI workflow — the publish gate should require those jobs instead of duplicating test/build steps).

## Current state

- `cli/` is excluded from root Bun workspaces (`package.json` workspaces list only `apps/*`, `packages/*`, `tooling/*`) and has its own `bun.lock`.
- Publishing is manual. Three conflicting versions exist right now: `cli/package.json` = `2.0.2`, root devDependency pin `init-now@2.0.1`, hardcoded banner `"2.0.0"` in `cli/src/index.ts:113`.
- `release-please-config.json` covers only the root template package (`init`, manifest `.template-version.json`). `.github/workflows/release.yml` runs release-please for the template only — no npm publish step anywhere.

## Tasks

### 1. Add the CLI to release-please — **lockstep versioning (decided)**

The template (`init`) and the CLI (`init-now`) share **one version number, always**. A significant template change bumps the CLI; a CLI change bumps the template. Rationale: one mental model ("init-now X.Y works with template X.Y"), one version to communicate on init.now. The accepted tradeoff — CLI-only releases produce template releases with no file changes — is mitigated in the `update` command (plan 06): when a sync classifies zero file changes, it reports "CLI-only release, nothing to sync" and just bumps `.template-version.json`.

- Add a second package entry to `release-please-config.json`: path `cli`, component `init-now`, `release-type: node`, its own changelog (`cli/CHANGELOG.md`), and use release-please's **`linked-versions` plugin** to group `init` + `init-now` (and later `create-init-now`, plan 11) into one version. Keep per-component tags (`init@vX.Y.Z`, `init-now@vX.Y.Z`) — same version, distinct tags.
- Adoption wrinkle: versions have already diverged (template `1.1.0`, CLI `2.0.2`). npm can't go backward, so the first linked release unifies both at the next version above the highest (e.g. `2.1.0`). One-way door — note it in the release PR.
- Lockstep doubles as the compatibility check: the CLI compares its own (macro-inlined) version against the fetched template's version and warns on **major** mismatch ("run `bunx init-now@latest`") — protects stale globally-installed CLIs. No separate schema-version field needed.
- Add `"cli"` to the manifest. Note: the manifest is `.template-version.json`, which the CLI also uses as the project marker and version record (`cli/src/utils.ts:83-101` reads key `"."`). Verify adding a `"cli"` key doesn't confuse `getVersion` (it reads `"."` specifically — should be fine; add a CLI unit test to lock that in). Also verify `setup`'s cleanup doesn't strip the `"cli"` key in scaffolded projects — scaffolded projects don't contain `cli/`, so release-please never runs there; leaving the extra key is harmless, but stripping it during `setup` is cleaner. Pick one and test it.

### 2. npm publish workflow

Extend `.github/workflows/release.yml` (release-please outputs per-path release flags):

- When a `cli` release is created: `cd cli && bun install && bun run build && npm publish --provenance --access public` (bunup build per `cli/bunup.config.ts`; bin shim `cli/bin/init-now` imports `dist/`). Requires `NPM_TOKEN` secret (or npm trusted publishing/OIDC — prefer OIDC if configured).
- Run `cd cli && bun test` as a gate before publish.
- Confirm `cli/package.json` `files` includes `dist/` and `bin/` and nothing else leaks (no `dist/` currently gitignored issues, no `.claude/`).

### 3. Single version source

- Banner version read from `cli/package.json` (plan 01 item 2) — verify done.
- Root `devDependencies["init-now"]`: bump to the current release. Optional: a small post-release automation (renovate rule or a step in the release workflow that opens a PR bumping the root pin). At minimum, document the manual step in `cli/README.md`.

### 4. Conventional-commit scoping

Ensure release-please attributes commits correctly: commits touching `cli/**` drive `init-now` releases (release-please does this by path automatically). Document in `cli/README.md`: CLI changes use normal conventional commits; no manual version bumps ever.

## Acceptance criteria

- Merging a `fix:` commit touching `cli/` to `main` produces a release-please PR bumping `init` and `init-now` to the **same version** (linked); merging it publishes `init-now` to npm with tag `init-now@vX.Y.Z` and cuts the template release `init@vX.Y.Z`.
- Template-only releases also bump the CLI to the matching version and republish it.
- After any release: `init-now --version` == npm version == template version in `.template-version.json`.
- The CLI warns on major-version mismatch against a fetched template snapshot.
- No hardcoded version strings remain: `rg '2\.0\.[0-9]' cli/src` returns nothing.
