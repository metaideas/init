# AGENTS.md

## Project Structure

- Projects are organized in the following folders:
  - `apps` - Cross-platform applications and user-facing products.
  - `infra` - Infrastructure as code for local development and cloud providers.
  - `packages` - Shared internal packages for use across apps.
  - `scripts` - Scripts for random tasks, such as syncing the project with the template and graphing dependencies.
  - `tooling` - Shared development configuration and script helpers. If a configuration is used across workspaces and not related to a specific package, it should go here.
- Apps and packages have their code in the `src` folder.
- Apps organized in the following folders:
  - `app`/`routes`/`entrypoints` - The router/entrypoint of the application, usually using file-based routing.
  - `features` - Feature-based modules.
  - `shared` - Shared utilities and helpers.
- We enforce a unidirectional import flow between these three folders. The code only flows downwards to the routing folder, never going upwards.
  - `shared` only imports outside dependencies. It cannot import from `features` or `routes`. Modules in `shared`  should be self-contained but can import from other modules in `shared`.
    - `shared` should be used for services, utilities, and helpers that are used across the application.
  - `features` can import from `shared`, but cannot import from other features.
  - `routes` can import from `shared` and `features`, but routes cannot from other routes.

## Code Quality

- We use `adamantite` for linting, formatting and type checking.
  - `adamantite check` to run linting checks.
  - `adamantite format` to format the code.
  - `adamantite typecheck` to type check the code.
  - `adamantite analyze` to analyze the code for unused dependencies.
- Always run `bun run format` after editing files.
- Run `bun run test` to run the test suite.
- After making changes, run `bun run check`, `bun run typecheck` and `bun run test` to ensure the code is still valid.
- After deleting files, run `bun run analyze` to ensure we are not using any dependencies that are not needed.

## Testing

- We use `bun:test` for testing.
- Add tests to a `__tests__` folder alongside the file under test.
- Import from `bun:test`.
- Use `test`, `describe`, and `expect`.
- `describe` is named after the function under test.
- `test` is named after the case. Use descriptive names for test cases.
- Use Bun testing best practices.

## Comment Policy

- Comments that repeat what code does are unacceptable.
- Delete commented-out code.
- Avoid obvious comments ("increment counter").
- Use good naming instead of comments.
- Avoid comments about updates to old code ("<- now supports xyz").
- Code should be self-documenting; if a comment explains WHAT, refactor instead.

## Version Control

- Use `git` for version control.
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:`, `revert:`, `release:`, `deps:`, `wip:`, `breaking:`, `deprecate:`).

## Coding Style (applies to `*.ts`, `*.tsx`)

### General (TypeScript)

- Write concise, technical TypeScript code.
- Use functional and declarative programming; avoid classes unless necessary.
- Prefer iteration and modularization over duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Use descriptive function names with auxiliary verbs (e.g., `getUserSettings`, `setUserSettings`, `checkIsMobile`).
- Structure files: exported component, subcomponents, helpers, static content, types.

### Imports

- We use subpath imports for imports within the same package.
  - Subpath imports are prefixed with `#` and are relative to the `src` folder.
- Reduce relative imports as much as possible.
- Use the `@init/` alias for importing packages in the monorepo.
- Never allow imports between `apps`. The only exception is the `api/src/client.ts` file.
- Avoid circular imports.

### Naming Conventions

- Use lowercase with dashes (kebab-case) for directories and files (e.g., `components/auth-wizard`).
- Favor default exports for components, unless exporting multiple functions.

### TypeScript Usage

- Use TypeScript for all code; prefer `type` over `interface`.
- Avoid enums; use readonly arrays or maps with `as const`.
- Use functional components with props and children, and destructure props.

### Syntax and Formatting

- Use the `function` keyword for pure functions.
- Use the `function` keyword for components.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

### UI and Styling

- Use components inside `@init/ui` for web projects and `#shared/components/ui` for mobile projects.
- Use the `cn` function inside `@init/utils/ui` for classname composition.

## Database (applies to `packages/db/**`)

- Our database schema is in `packages/db/src/schema.ts`.
- We use Drizzle as our ORM. Follow Drizzle best practices.
- Use timestamps in `packages/db/src/schema.ts` where it makes sense.
- Use prefixed IDs for entities; see `packages/db/src/schema.ts` and the `id` function.
- Prefixes should be 4 letters with no conflicts.

## Expo (applies to `apps/mobile/**`)

- Prefer functional components with React hooks.
- Leverage Expo SDK features and APIs.
- Use React Navigation for structure and navigation.
- Manage assets with Expo's asset system.
- Use Reanimated for performant animations.

## Hono (applies to `apps/api/**`)

- Use middleware for authentication and logging.
- Implement route handlers using `app.get`, `app.post`, etc.
- Structure routes modularly.
- Handle errors globally with `app.onError`.
- Use `c.text()`, `c.json()`, and `c.redirect()` for responses.
- Leverage caching with `Cache-Control` or KV storage.

## Web UI (applies to `apps/app/**`, `apps/desktop/**`, `apps/docs/**`, `apps/extension/**`, `apps/web/**`)

- Use components inside `@init/ui` with proper composition and customization.
- Leverage Radix UI primitives for accessible interactive components.
- Follow Tailwind CSS class naming conventions and utility patterns.
- Implement mobile-first responsive design with Tailwind breakpoints.
- Maintain consistent spacing and layout using Tailwind's spacing scale.
- Use Tailwind's color system for consistent theming.
- Implement dark mode support using Tailwind's `dark` variant.
- Ensure components are accessible following WCAG guidelines.
- Keep component styles modular and reusable.
- Optimize component bundle size through proper code splitting.
