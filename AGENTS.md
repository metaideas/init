# AGENTS.md

Read [`CONTEXT.md`](./CONTEXT.md) before exploring or changing code. It defines the
project's vocabulary.

## Repository guidance

- Follow [`docs/agents/domain.md`](./docs/agents/domain.md) when exploring architecture
  or recording domain decisions.
- Follow [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md) and
  [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md) for issue work when
  those files exist.

## Testing

- Use Bun for package management and script execution.
- Use `bun:test`.
- Add tests to a `__tests__` folder alongside the file under test.
- Import `describe`, `expect`, and `test` from `bun:test`.
- Name `describe` blocks after the function under test and test cases after the behavior.
- Use `bun run build --filter=<workspace>` for targeted builds.

## Comments

- Prefer clear names and structure over explanatory comments.
- Do not add comments that repeat the code, describe an obvious operation, or narrate a
  change from an older implementation.
- Delete commented-out code.

## Version control

- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
  `test:`, `perf:`, `build:`, `ci:`, `revert:`, `release:`, `deps:`, `wip:`,
  `breaking:`, `deprecate:`).

## TypeScript style

- Write concise, technical TypeScript with functional and declarative patterns.
- Prefer `type` over `interface`; avoid enums in favor of readonly arrays or maps with
  `as const`.
- Use the `function` keyword for pure functions and components.
- Use descriptive names with auxiliary verbs for state and behavior.
- Use lowercase kebab-case for directories and files.
- Favor default exports for components unless a module exports multiple functions.
- Keep exported components first, followed by subcomponents, helpers, static content,
  and types.

## Imports and boundaries

- Use `#` subpath imports within a package; they resolve from its `src` directory.
- Use `@init/*` to import another workspace package.
- Never import between apps, except from `apps/api/src/client.ts`.
- Within an app, imports flow `shared` → `features` → routes/entrypoints:
  - `shared` imports only dependencies and other `shared` modules.
  - A feature may import `shared`, but not another feature.
  - Routes and entrypoints may import `shared` and features, but not other routes.
  - `apps/api` routes may import other routes for Hono composition.
- Avoid circular imports.

## UI

- Use `@init/ui` for web UI and `#shared/components/ui` for mobile UI.
- Use `cn` from `@init/utils/ui` for class name composition.
- Keep web UI responsive, accessible, dark-mode compatible, and composed from the
  existing Radix and Tailwind foundations.

## Scoped rules

- `packages/db/**`: use Drizzle, the shared prefixed-ID helper, non-conflicting
  four-letter ID prefixes, and timestamps where appropriate.
- `apps/mobile/**`: use functional React components, Expo APIs, Expo Router navigation,
  Expo asset handling, and Reanimated for performance-sensitive animation.
- `apps/api/**`: use Hono middleware for authentication and logging, modular handlers,
  `app.onError` for global errors, and Hono response helpers.

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
