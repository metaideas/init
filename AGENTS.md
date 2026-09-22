# AGENTS.md

<!-- TEMPLATE:START -->

`init` is a modern, opinionated monorepo template for TypeScript projects. It is designed to easily deploy products spanning multiple platforms.

<!-- TEMPLATE:END -->

Before you explore or change code, read the relevant `CONTEXT.md` files. Use the ubiquitous language in these files.

<!-- TEMPLATE:START -->

## Working with `init`

When working with `init`, you should always keep the following in mind:

1. This is a template, not a finished product. There will be gaps in the implementation that scaffolded projects will need to fill in. This is fine, as long as we don't ship anything in a broken state.
2. Consistency is paramount. We reduce cognitive overhead by making sure that all application workspaces are structured similarly, and all package workspaces are structured similarly.
3. Every workspace is selectable. After you remove one, the rest must still build, with no leftover imports or required environment variables. Application workspaces can depend on package workspaces. Package workspaces never depend on application workspaces.
4. Package workspaces own their domain. Constants, types, and environment variables live in the package workspace that uses them.
5. `@init/utils` is not a junk drawer. Add a helper there only when several workspaces use it and no single package workspace owns it.
6. Prefer a small, focused dependency over custom code. Delete code that nothing uses.
7. Tooling will change. Keep each third-party dependency behind the package workspace that owns it, so replacing it is a change to one workspace.
8. Local development works with only the repository and its Docker Compose services. Cloud services and external accounts are opt-in.
9. Keep the scaffold small. Ship optional code as a template recipe in `turbo/generators/` that a scaffolded project adds when it needs it. Add code to a workspace only when every scaffolded project that selects the workspace uses it.
10. Content that only maintainers use is an internal cleanup path, and `bun template setup` removes it. List a whole file or folder in `init.cleanupPaths` in the root `package.json`. For part of a file that ships, wrap it in `TEMPLATE:START` and `TEMPLATE:END` comments and list the file in `init.cleanupSections`.

<!-- TEMPLATE:END -->

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

## Generated files

Generated source files and types are not in version control. `bun run check` does not generate them.

- After you clone the repository, create a worktree, or install dependencies, run `bun run codegen`.
- After you change an `.env.schema` file, a package `env` contract, or the internationalization messages, run `bun run codegen` again.

<!-- ADAMANTITE:START -->

## Adamantite

This project uses Adamantite for its managed formatting, linting, type checking, and dependency-analysis setup.

- Prefer the package scripts Adamantite added for this workspace.
- Run `bun run check` to catch lint and type issues. Direct command: `adamantite check`.
- Run `bun run fix` to apply safe lint fixes. Direct command: `adamantite fix`.
- Run `bun run analyze` after changing dependencies, imports, or exports. Direct command: `adamantite analyze`.
- Use `adamantite doctor` to inspect managed setup and `adamantite doctor --fix` for safe local fixes.

<!-- ADAMANTITE:END -->
