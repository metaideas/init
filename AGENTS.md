# AGENTS.md

## Project Structure

Check the [project structure documentation](./docs/project-structure.md) for an overview of the project structure and where to find different types of code.

## Code Quality

- Always run `bun run format` after editing files.
- Run `bun run test` to run the test suite.
- After making changes, run `bun run check` and `bun run test` to ensure the code is still valid.
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
- Use components inside `@init/ui` for web projects and `@init/native-ui` for mobile projects.
- Use the `cn` function inside `@init/utils/ui` for classname composition.
