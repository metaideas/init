# AGENTS.md

Use ASD-STE100 Simplified Technical English for all communication.

Before you explore or change code, read the relevant `CONTEXT.md` files. Use the
ubiquitous language in these files.

## Repository guidance

- When you explore architecture, follow [`docs/agents/domain.md`](./docs/agents/domain.md).
- When you record domain decisions, follow [`docs/agents/domain.md`](./docs/agents/domain.md).
- For issue work, follow the guidance for issue trackers and triage labels in
  `docs/agents/` when the files exist.

## Coding standards

Before you write code, read the standard that applies to your task:

- Tests: [`docs/agents/testing.md`](./docs/agents/testing.md)
- Comments: [`docs/agents/comments.md`](./docs/agents/comments.md)
- Commits: [`docs/agents/version-control.md`](./docs/agents/version-control.md)
- TypeScript style: [`docs/agents/typescript-style.md`](./docs/agents/typescript-style.md)
- Imports and boundaries: [`docs/agents/imports-and-boundaries.md`](./docs/agents/imports-and-boundaries.md)
- UI: [`docs/agents/ui.md`](./docs/agents/ui.md)

## Workspace rules

Each workspace with special rules has its own `AGENTS.md`:

- [`packages/db/AGENTS.md`](./packages/db/AGENTS.md)
- [`apps/mobile/AGENTS.md`](./apps/mobile/AGENTS.md)
- [`apps/api/AGENTS.md`](./apps/api/AGENTS.md)

<!-- ADAMANTITE:START -->

## Adamantite

This project uses Adamantite for its managed formatting, linting, type checking, and dependency-analysis setup.

- Prefer the package scripts Adamantite added for this workspace.
- Run `bun run format` after editing files. Direct command: `adamantite format`.
- Run `bun run check` to catch lint and type issues. Direct command: `adamantite check`.
- Run `bun run fix` to apply safe lint fixes. Direct command: `adamantite fix`.
- Run `bun run analyze` after changing dependencies, imports, or exports. Direct command: `adamantite analyze`.
- Run `bun run check:monorepo` to check monorepo package consistency. Direct command: `adamantite monorepo`.
- Run `bun run fix:monorepo` to fix monorepo package consistency. Direct command: `adamantite monorepo --fix`.
- Use `adamantite doctor` to inspect managed setup and `adamantite doctor --fix` for safe local fixes.

<!-- ADAMANTITE:END -->
