# Plan 12 — AGENTS.md → AGENTS.md + CONTEXT.md + docs refactor

Restructure this repo's agent-facing documentation from one overloaded `AGENTS.md` into the layered setup: **`AGENTS.md`** (standing rules and commands) + **`CONTEXT.md`** (domain language and orientation) + **`docs/`** (agent workflow docs, ADRs). This is the layout the maintainer's engineering skills expect (`setup-matt-pocock-skills`, consumed by `domain-modeling`, `triage`, `grilling`, etc. — see `~/.agents/skills/setup-matt-pocock-skills/SKILL.md`), and **`../adamantite` is the live reference implementation** (its `AGENTS.md`, `CONTEXT.md`, and `docs/agents/` show the target shape).

## The split

Roles, per the skill's model:

- **`AGENTS.md`** — standing rules only: quality-control commands (format/check/analyze/test), comment policy, version control, coding style, import rules. Short. Points to `CONTEXT.md` and `docs/agents/*` instead of inlining everything. Project structure does not live here. See `../adamantite/AGENTS.md` — note how it opens with skill wiring (issue tracker, triage labels, domain docs) in a few lines each, with details delegated to `docs/agents/*.md`.
- **`CONTEXT.md`** — _what things mean_, not rules: what init is, the glossary
  (template vs scaffolded project, workspace, template recipe, internal cleanup path,
  backend alternatives, preset, ...), architectural orientation (apps/packages/tooling
  flow, unidirectional imports **as a concept**), and pointers to ADRs. Keep detailed
  project structure outside both `AGENTS.md` and `CONTEXT.md`; `CONTEXT.md` links to
  `docs/template/project-structure.md` as the canonical reference. See
  `../adamantite/CONTEXT.md` for tone: "Read this before exploring or changing code so
  you use the project's own terms."
- **`docs/agents/`** — skill wiring docs: `issue-tracker.md`, `triage-labels.md`, `domain.md` (consumer rules for the domain docs).
- **`docs/adr/`** — architectural decision records. Seed it with the decisions already made in these plans, so they stop living only in `.plans/`:
  - Convex backend lives in `packages/`, is an alternative to `apps/api` (plan 05's AGENTS.md carve-out becomes an ADR + a glossary entry)
  - Package vs template-recipe criterion (tracker / plan 07)
  - Zero-external-services-by-default principle
  - Desktop is local-first by default (plan 03 §4b)
  - files-sdk adoption direction (from `docs/research/files-sdk.md`, when acted on)

## Single- vs multi-context

**Decided: single-context** (one root `CONTEXT.md` + `docs/adr/`). This repo is a
monorepo, but it is one product (the template) with one domain language; per-workspace
CONTEXT files would mostly restate the root. `apps/web` is both the deployed Init site
and a scaffolded example, so it remains inside this context. Revisit multi-context
(`CONTEXT-MAP.md` + per-context files) only if the generator implementation or another
template subsystem develops enough independent vocabulary to justify it.

Consider running the `setup-matt-pocock-skills` skill to scaffold section A–C choices interactively rather than hand-writing them.

## Content migration map

From the current `AGENTS.md`:

| Current AGENTS.md section                                                                 | Destination                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Structure (folder meanings, import flow rationale)                                | `docs/template/project-structure.md`; `CONTEXT.md` provides orientation and links to it; keep only terse import-boundary enforcement in `AGENTS.md`                                 |
| Testing, Comment Policy, Version Control, Coding Style, Imports, Naming, TS Usage, Syntax | stay in `AGENTS.md` (rules) — tighten wording                                                                                                                                       |
| Database / Expo / Hono / Web UI sections                                                  | stay in `AGENTS.md`, or move to scoped `AGENTS.md` files per directory if supported tooling prefers colocation — keep whichever is shorter                                          |
| Adamantite managed block                                                                  | stays in `AGENTS.md` (it's command rules; the block is tool-managed)                                                                                                                |
| Stale claims                                                                              | fix during migration: describe `scripts/` as the local template-management command surface; remove claims about a published CLI, automated template sync, or hosted recipe registry |

Move `docs/project-structure.md` to `docs/template/project-structure.md`. Update `CONTEXT.md`, the template `README.md`, and all internal links to use the new path (plan 05 already touches the backend parts — coordinate, don't duplicate). The document ships with scaffolded projects and is the canonical detailed project-structure reference.

## Template implications (this repo is a template!)

Scaffolded projects inherit these files. Decide per file:

- `AGENTS.md`, `CONTEXT.md` — **ship to users**: new projects start with the layout, the glossary, and the standing rules; users' agents then maintain them.
- `docs/adr/` — **template-internal, stripped on install** (decided). The ADRs record
  why the _template_ is shaped the way it is (backend-in-packages,
  package-vs-template-recipe criterion, desktop local-first, ...)—essential for agents
  evolving the template and irrelevant-to-misleading inside a consumer project. Add
  `docs/adr/` to root `package.json`'s `init.cleanupPaths` and extend the scaffold smoke
  test. Consumers create their own `docs/adr/` lazily through the `domain-modeling`
  skill when their first decision lands.
  - Consequence for `CONTEXT.md`: since it ships but the ADRs don't, any consumer-relevant decision must be _summarized inline_ in CONTEXT.md (glossary/orientation entries, e.g. what the backend alternative means), with ADR links kept in a clearly template-only section or phrased so their removal doesn't leave dangling references. Template-only docs referenced by CONTEXT.md (e.g. `docs/research/*`) follow the same rule: keep in template, strip on install, never load-bearing for the shipped text.
- `docs/agents/issue-tracker.md`, `triage-labels.md` — these encode _this repo's_
  tracker (`metaideas/init`). **Decided: strip during `bun template setup`**—add both to
  root `package.json`'s `init.cleanupPaths` and the scaffold smoke test. Scaffolded
  projects run `setup-matt-pocock-skills` themselves to generate their own; the shipped
  `AGENTS.md` should note that.
- `CLAUDE.md`/`.cursorrules`-style duplicates: none exist today — keep it that way; `AGENTS.md` is the single agent entrypoint.

## Acceptance criteria

- `AGENTS.md` contains only standing rules + pointers and does not duplicate project structure; `CONTEXT.md` exists with glossary and orientation and links to `docs/template/project-structure.md`; `docs/agents/` + `docs/adr/` exist with at least the seed ADRs listed above.
- `docs/project-structure.md` has moved to `docs/template/project-structure.md`, and all links use the new path.
- No stale claims: `rg "syncing the project with the template" AGENTS.md docs/` returns nothing pointing at `scripts/`.
- The maintainer's skills work against the layout: `domain-modeling` finds `CONTEXT.md`/`docs/adr/`, `triage` finds the label vocabulary doc.
- A scaffolded project receives a coherent doc set: `AGENTS.md` + `CONTEXT.md` with no
  dangling references—no `docs/adr/`, tracker docs, or references to stripped
  template-internal machinery (`.plans/`, `docs/research/`). Consumer-facing
  docs may describe the local template recipes that remain in `turbo/generators/`, but
  must not imply a hosted registry or updater exists.
