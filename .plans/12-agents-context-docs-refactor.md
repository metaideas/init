# Plan 12 — AGENTS.md → AGENTS.md + CONTEXT.md + docs refactor

**Status:** Completed

Restructure this repo's agent-facing documentation from one overloaded `AGENTS.md` into
the layered setup: **`AGENTS.md`** (standing rules and commands) + **`CONTEXT.md`**
(domain language and orientation) + **`docs/`** (agent workflows, application
architecture, and template governance). This is the layout the maintainer's engineering
skills expect (`setup-matt-pocock-skills`, consumed by `domain-modeling`, `triage`,
`grilling`, etc. — see `~/.agents/skills/setup-matt-pocock-skills/SKILL.md`), and
**`../adamantite` is the live reference implementation** (its `AGENTS.md`, `CONTEXT.md`,
and `docs/agents/` show the target shape).

Template-governance decisions and documentation about the actual application code are
different domains. They must not share an ADR namespace or be presented as if a
scaffolded project's owner made the template maintainer's decisions.

## The split

Roles, per the skill's model:

- **`AGENTS.md`** — standing rules only: quality-control commands (format/check/analyze/test), comment policy, version control, coding style, import rules. Short. Points to `CONTEXT.md` and `docs/agents/*` instead of inlining everything. Project structure does not live here. See `../adamantite/AGENTS.md` — note how it opens with skill wiring (issue tracker, triage labels, domain docs) in a few lines each, with details delegated to `docs/agents/*.md`.
- **`CONTEXT.md`** — _what things mean_, not rules: what init is, the glossary
  (template vs scaffolded project, workspace, template recipe, internal cleanup path,
  backend alternatives, preset, ...), architectural orientation (apps/packages/tooling
  flow, unidirectional imports **as a concept**), and pointers to application
  architecture. Keep detailed
  project structure outside both `AGENTS.md` and `CONTEXT.md`; `CONTEXT.md` links to
  `docs/architecture/project-structure.md` as the canonical reference. See
  `../adamantite/CONTEXT.md` for tone: "Read this before exploring or changing code so
  you use the project's own terms."
- **`docs/agents/`** — skill wiring docs: `issue-tracker.md`, `triage-labels.md`,
  `domain.md` (routing rules for the two documentation domains).
- **`docs/architecture/`** — facts and guidance about the application code that ships:
  workspace structure, import flow, backend topology, desktop behavior, and file-service
  security/composition. These documents ship with scaffolded projects.
- **`docs/template/`** — upstream-only governance and research. It contains
  `docs/template/adr/` and `docs/template/research/` and is removed during installation.
- **`docs/template/adr/`** — template decision records. Seed it with decisions already
  made in these plans, phrased as template selection/governance decisions:
  - Package vs template-recipe criterion (tracker / plan 07).
  - Zero-external-accounts-and-hosted-services default.
  - Why backend alternatives are selected as workspaces and why Convex is offered from
    `packages/backend`.
  - Why `apps/web` is both the Init site and the replaceable starter marketing app.
  - Why Files SDK is built into a selected `apps/api` workspace while its application
    clients remain optional generators.
- **`docs/adr/`** — reserved for decisions made by the owner of a scaffolded
  application. Do not create or seed this directory in the template. Consumers create
  it when their first project-specific decision lands.

## Single- vs multi-context

**Decided: single application context** (one root `CONTEXT.md` +
`docs/architecture/`). This repo is a monorepo, but its shipped workspaces form one
starter application model; per-workspace CONTEXT files would mostly restate the root.
Template governance is a separate documentation domain under `docs/template/`, not a
second application CONTEXT. `apps/web` is both the deployed Init site and a scaffolded
example, so its runtime architecture remains inside the application context while the
decision to give it both roles belongs in a template ADR. Revisit multi-context
(`CONTEXT-MAP.md` + per-context files) only if a runtime subsystem develops enough
independent vocabulary to justify it.

Consider running the `setup-matt-pocock-skills` skill to scaffold section A–C choices interactively rather than hand-writing them.

## Content migration map

From the current `AGENTS.md`:

| Current AGENTS.md section                                                                 | Destination                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project Structure (folder meanings, import flow rationale)                                | `docs/architecture/project-structure.md`; `CONTEXT.md` provides orientation and links to it; keep only terse import-boundary enforcement in `AGENTS.md`                             |
| Testing, Comment Policy, Version Control, Coding Style, Imports, Naming, TS Usage, Syntax | stay in `AGENTS.md` (rules) — tighten wording                                                                                                                                       |
| Database / Expo / Hono / Web UI sections                                                  | stay in `AGENTS.md`, or move to scoped `AGENTS.md` files per directory if supported tooling prefers colocation — keep whichever is shorter                                          |
| Adamantite managed block                                                                  | stays in `AGENTS.md` (it's command rules; the block is tool-managed)                                                                                                                |
| Stale claims                                                                              | fix during migration: describe `scripts/` as the local template-management command surface; remove claims about a published CLI, automated template sync, or hosted recipe registry |

Move `docs/project-structure.md` to `docs/architecture/project-structure.md`. Update
`CONTEXT.md`, the template `README.md`, and all internal links to use the new path (plan
05 already touches the backend parts — coordinate, don't duplicate). The document ships
with scaffolded projects and is the canonical detailed project-structure reference.

Move `docs/research/files-sdk.md` to
`docs/template/research/files-sdk.md`. Research performed to choose or evolve template
defaults is upstream context, not documentation of the generated application's runtime.
Keep consumer-operational documents such as `docs/getting-started.md`,
`docs/generators.md`, and `docs/template-commands.md` outside `docs/template/`: despite
their names, they describe commands and capabilities that remain available after
scaffolding.

## Template implications (this repo is a template!)

Scaffolded projects inherit these files. Decide per file:

- `AGENTS.md`, `CONTEXT.md` — **ship to users**: new projects start with the layout, the glossary, and the standing rules; users' agents then maintain them.
- `docs/architecture/` — **ship to users**: it describes the code and runtime structure
  they receive. Application facts selected by the template must be stated without
  presenting the template maintainer's rationale as the consumer's own decision.
- `docs/template/` — **template-internal, stripped on install** (decided). Its ADRs
  explain why the upstream template is shaped this way, and its research supports those
  choices. Add the whole directory to root `package.json`'s `init.cleanupPaths` and
  extend the scaffold smoke test.
- `docs/adr/` — **absent initially**. Consumers create their own directory lazily
  through the `domain-modeling` skill. Never seed it with upstream template decisions.
  - Consequence for `CONTEXT.md`: because it ships, its application orientation must be
    self-contained and may link only to shipped `docs/architecture/*` documents.
    Template ADRs and research must not be load-bearing or linked from consumer-facing
    sections.
- `docs/agents/issue-tracker.md`, `triage-labels.md` — these encode _this repo's_
  tracker (`metaideas/init`). **Decided: strip during `bun template setup`**—add both to
  root `package.json`'s `init.cleanupPaths` and the scaffold smoke test. Scaffolded
  projects run `setup-matt-pocock-skills` themselves to generate their own; the shipped
  `AGENTS.md` should note that.
- `docs/agents/domain.md` — ships, but routes conditionally: when `docs/template/`
  exists, upstream template decisions go to `docs/template/adr/`; project-specific
  decisions go to `docs/adr/`. After installation only the latter route remains.
- `CLAUDE.md`/`.cursorrules`-style duplicates: none exist today — keep it that way; `AGENTS.md` is the single agent entrypoint.

## Acceptance criteria

- `AGENTS.md` contains only standing rules + pointers and does not duplicate project
  structure; `CONTEXT.md` exists with glossary and orientation and links to
  `docs/architecture/project-structure.md`.
- `docs/architecture/` documents shipped application code;
  `docs/template/adr/` contains the seed template decisions listed above; no seeded
  `docs/adr/` exists.
- `docs/project-structure.md` has moved to
  `docs/architecture/project-structure.md`, `docs/research/files-sdk.md` has moved to
  `docs/template/research/files-sdk.md`, and all links use the new paths.
- No stale claims: `rg "syncing the project with the template" AGENTS.md docs/` returns nothing pointing at `scripts/`.
- The maintainer's skills work against the layout: `domain-modeling` routes template
  decisions to `docs/template/adr/` and application decisions to `docs/adr/`; `triage`
  finds the label vocabulary doc.
- A scaffolded project receives a coherent doc set: `AGENTS.md` + `CONTEXT.md` with no
  dangling references—no seeded `docs/adr/`, `docs/template/`, tracker docs, or
  references to stripped template-internal machinery (`.plans/`). Consumer-facing
  docs may describe the local template recipes that remain in `turbo/generators/`, but
  must not imply a hosted registry or updater exists.
