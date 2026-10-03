# AGENTS.md

<!-- TEMPLATE:START -->

`init` is a modern, opinionated monorepo template for TypeScript projects. It is designed to easily deploy products spanning multiple platforms.

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

## Template vocabulary

Use these terms in issues, plans, code, and documentation. Do not use the alternatives.

- **Template**: the upstream `metaideas/init` repository before developers install it. Not "starter" or "boilerplate".
- **Scaffolded project**: a separately owned repository that developers create from the template. Not "template instance" or "downstream template".
- **Workspace**: a selectable application workspace or package workspace. Not "module" or "project".
- **Application workspace**: a product surface that users see or that runs independently. Not "app package".
- **Package workspace**: runtime code that application workspaces or other package workspaces share. Not "application package".
- **Template recipe**: copy-once code in `turbo/generators/` that a scaffolded project owns after generation. Not "plugin" or "recipe package".
- **Template command**: a local command that configures a scaffolded project or manages its workspaces, such as `bun template setup` or `bun template doctor`. Use "Turbo generator" only for the mechanism that runs a template recipe.
- **Internal cleanup path**: content that only maintainers use. Setup removes it from a scaffolded project.
- **Backend alternative**: an optional backend shape that a scaffolded project selects. Not "required backend" or "backend layer".
- **Preset**: a reusable configuration for an environment or tooling that a template command selects.
- **Skill**: an agent workflow in `.agents/skills/` that drives template commands and generators toward a passing `bun template doctor`.

<!-- TEMPLATE:END -->

## Skills

Template work runs through the skills in `.agents/skills/`. Each skill states which template command or Turbo generator does the mechanical part and ends with `bun template doctor`; a passing doctor is the definition of done for setup, workspace changes, backend connections, and template updates. Reach for `setup`, `add-workspace`, `remove-workspace`, `connect-backend`, `new-package`, `new-feature`, `update-from-template`, or `doctor` before editing those areas by hand.

## Architecture

Before you explore or change code, read `docs/project-structure.md`. Use the same vocabulary in issues, plans, code, and documentation. Before you add a term, verify that it names a real distinction, then define it once in the package workspace that owns the domain.

## Coding standards

### TypeScript style

- Write concise, technical TypeScript.
- Use functional and declarative patterns.
- Prefer `type` to `interface`.
- Avoid enums.
- Use `readonly` arrays or maps with `as const`.
- Use the `function` keyword for pure functions and components.
- Use descriptive names.
- Name runtime validation schema constants in PascalCase, such as `UserIdSchema`. Put them in a `schemas.ts` file.
- Use auxiliary verbs for state and behavior.
- Use lowercase kebab-case names for directories and files.
- Favor default exports for components.
- Do not use a default export when a module exports multiple functions.
- Put exported components first. Then put subcomponents, helpers, static content, and types.

### Imports and boundaries

- Use `#` subpath imports within a package. They resolve from its `src` directory.
- Use `@init/*` to import another workspace package.
- Do not import between apps. An app that serves other apps exposes one client entry point, and other apps import only that.
- Within an app, imports flow `shared` → `features` → routes and entrypoints:
  - `shared` imports only dependencies and other `shared` modules.
  - A feature can import `shared`, but not another feature.
  - Routes and entrypoints can import `shared` and features, but not other routes. A route file can `import type` the router context from its entrypoint.
  - When an app has more than one entrypoint tier, such as a main process and a renderer, the tiers do not import each other. They communicate through a typed contract in `shared`.
- Avoid circular imports.
- Import validation from `@init/utils/schema/mini` in browser-reachable code and from `@init/utils/schema` when the full Zod API or a full-Zod integration is required. The Mini entry point never imports the full one.

### UI

- Use `@init/ui` for the web UI. Import one component per subpath, for example `@init/ui/components/button`.
- In `apps/mobile`, use the universal Expo UI components from `@expo/ui` for native controls and Uniwind `className` styles for React Native views.
- Use `cn` from the `cn` package to compose class names.
- Keep the web UI responsive, accessible, and compatible with dark mode.
- Compose the web UI from the existing Radix and Tailwind foundations.

### Tests

- Use Bun to manage packages and execute scripts.
- Use `bun:test`. Import `describe`, `expect`, and `test` from it.
- Add tests to a `__tests__` folder beside the file they test.
- Name each `describe` block after its function. Name each test case after its behavior.
- Use `bun run build --filter=<workspace>` for builds of a target workspace.

### Comments

- Prefer clear names and structure to explanatory comments.
- Do not add comments that repeat the code, describe an obvious operation, or describe a change from an earlier implementation.
- Delete all commented-out code.

### READMEs

- A workspace README is a heading and a one-line description. Do not add usage, setup, or structure notes. Put documentation in root `docs/` instead.

### Commits

- Use a conventional commit message (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:`, `revert:`, `release:`, `deps:`, `wip:`, `breaking:`, `deprecate:`).
- Give pull requests a conventional commit title. Squash merges use it as the commit message.

## Workspace notes

- `apps/api`: use Hono middleware for authentication and logging, modular route handlers, `app.onError` for global errors, and Hono response helpers. Routes can import other routes to compose the router.
- `apps/mobile`: use functional React components, Expo APIs, Expo Router for navigation, Expo for assets, and Reanimated for performance-sensitive animation.
- `apps/docs`: a standalone Starlight example. Put pages in `src/content/docs/` with `title` and `description` frontmatter. It does not publish the root `docs/` folder, which documents the template.
- `packages/core`: put business rules in `src/domains/<domain>/` and contracts for external capabilities, such as email delivery, in `src/services/<service>/`. Code that both use goes in `src/shared/`. Do not organize it by product feature.
- `packages/database`: use Drizzle, the shared prefixed-ID helper, and timestamps where appropriate.
- `packages/backend`: keep Convex functions in `public/`, `system/`, and `shared/`. Do not edit `_generated/`.
- `packages/ui`: components are copy-owned source from the shadcn registry, and oxlint checks them like any other code. After `components:add`, run `bun run fix` and resolve what `bun run check` still reports.

## Generated files

Each generated file follows the guidance of the tool that produces it.

- Committed: `routeTree.gen.ts` (TanStack Router) and `_generated/` under `packages/backend/src/functions/` (Convex). The framework `dev` or `build` command regenerates them. Commit the result with the change that caused it.
- Ignored: `env.generated.ts` (Varlock), `src/shared/internationalization/` (Paraglide), `.astro/` (Astro), and `.wxt/` (WXT). `bun run check` does not generate them.
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
