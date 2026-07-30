# Context

Domain language and orientation for Init. Read this before exploring or changing code so
you use the project's own terms. This file explains what things mean; standing rules and
commands live in [`AGENTS.md`](./AGENTS.md).

## What Init is

Init is a modern TypeScript monorepo template. A developer starts with one repository,
selects the application and package workspaces they need, then ships across web, API,
mobile, desktop, browser-extension, and documentation surfaces.

The template's working core requires no hosted services or external accounts. Optional
hosted capabilities are selected deliberately and remain ordinary workspaces or local
code generators rather than hidden requirements.

## Glossary

- **Template** — this upstream `metaideas/init` repository before installation. It
  contains application code plus maintainer-only governance and research.
- **Scaffolded project** — a repository created from the template and configured with
  `bun template setup`. It is owned independently after creation.
- **Workspace** — an app or package participating in the root Bun workspace and Turbo
  task graph.
- **Application workspace** — a user-facing surface under `apps/`, including the Hono
  API.
- **Package workspace** — reusable runtime code under `packages/`. A hosted backend
  consumed as a library can be a package even when it deploys separately.
- **Template recipe** — copy-once code generated from the scaffold's local
  `turbo/generators/` snapshot. The project owns generated files; there is no hosted
  recipe registry or recipe updater.
- **Template command** — the local `scripts/` command surface invoked with
  `bun template ...` to set up, rename, or add workspaces.
- **Internal cleanup path** — upstream-only content listed in
  `package.json#init.cleanupPaths` and removed during `bun template setup`.
- **Backend alternative** — either the optional Hono API workspace (`apps/api`) or
  Convex package workspace (`packages/backend`). Client adapters are added through the
  local `connect-backend` generator.
- **Preset** — reusable environment or tooling configuration selected from local
  project generators.

## Architectural orientation

The repository has four primary code areas:

- `apps/` contains independently runnable product surfaces.
- `packages/` contains runtime modules shared by those surfaces.
- `tooling/` contains shared development configuration.
- `infra/` contains local and cloud infrastructure definitions.

Application source follows a downward dependency flow: self-contained `shared` modules
support feature slices, and routes or entrypoints compose both. Features do not depend
on one another. Cross-application behavior belongs in a package rather than an app
import.

See [`docs/architecture/project-structure.md`](./docs/architecture/project-structure.md)
for the workspace map and import model. Runtime-specific orientation lives in:

- [`docs/architecture/backend-topology.md`](./docs/architecture/backend-topology.md)
- [`docs/architecture/desktop.md`](./docs/architecture/desktop.md)
- [`docs/architecture/file-service.md`](./docs/architecture/file-service.md)

## Documentation domains

`CONTEXT.md` and `docs/architecture/` describe the application that ships. They remain
useful after scaffolding and must not depend on upstream-only files.

Application owners record their own decisions in `docs/adr/`, creating it when the first
decision lands. The upstream template's selection rationale and research live under
`docs/template/` and are removed during installation.
