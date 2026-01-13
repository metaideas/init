# AGENTS.md

## Quality Control

- We use `adamantite` for linting, formatting and type checking.
- Always run `bun run format` after editing files.
- After making changes, run `bun run check`, `bun run typecheck` and `bun run test` to ensure the code is still valid.
- After installing or removing dependencies, run `bun run analyze` to ensure we are not using any dependencies that are not needed.

## Bun Usage (general)

- Default to using Bun instead of Node.js.
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`.
- Use `bun test` instead of `jest` or `vitest`.
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`.
- Use `bun install` instead of `npm install`, `yarn install`, or `pnpm install`.
- Use `bun run <script>` instead of `npm run <script>`, `yarn run <script>`, or `pnpm run <script>`.
- Bun automatically loads `.env`, so don't use dotenv.
- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- Use `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- Use `Bun.redis` for Redis. Don't use `ioredis`.
- Use `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s `readFile`/`writeFile`.
- Use `Bun.$` for shelling out instead of execa.

## Comment Policy (applies to `*.ts`, `*.tsx`, `*.js`, `*.jsx`)

- Comments that repeat what code does are unacceptable.
- Delete commented-out code.
- Avoid obvious comments ("increment counter").
- Use good naming instead of comments.
- Avoid comments about updates to old code ("<- now supports xyz").
- Code should be self-documenting; if a comment explains WHAT, refactor instead.

## Version Control

- Use `git` for version control.
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `test:`, `perf:`, `build:`, `ci:`, `revert:`, `release:`, `deps:`, `wip:`, `breaking:`, `deprecate:`).

## Coding Style (applies to `*.ts`, `*.tsx`)

### Key Principles

- Write concise, technical TypeScript code.
- Use functional and declarative programming; avoid classes.
- Prefer iteration and modularization over duplication.
- Use descriptive variable names with auxiliary verbs (e.g., `isLoading`, `hasError`).
- Use descriptive function names with auxiliary verbs (e.g., `getUserSettings`, `setUserSettings`, `checkIsMobile`).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow the project structure in `README.md`.

### Imports

- For packages inside `apps`, use the `~/` alias for imports from `[app]/src`.
- For packages inside `packages`, use relative imports.
- Use the `@init/` alias for importing packages in the monorepo.
- Never allow imports between `apps`, except from `apps/api/src/client.ts` as a dev dependency.
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

- Follow the coding styles in `packages/db/src/schema/auth.ts` and `packages/db/src/schema/organizations.ts`.
- We use Drizzle as our ORM. Follow Drizzle best practices.
- Always add relations to `packages/db/src/schema/relations.ts` following existing patterns.
- Use timestamps in `packages/db/src/schema/helpers.ts` where it makes sense.
- Tables related to core logic go inside `packages/env/src/core.ts`.
- Use prefixed IDs for entities; see `packages/db/src/schema/helpers.ts` and `constructId`.
- Prefixes should be 3 letters with no conflicts.

## Expo (applies to `apps/mobile/**`)

- Prefer functional components with React hooks.
- Leverage Expo SDK features and APIs.
- Use React Navigation for structure and navigation.
- Manage assets with Expo's asset system.
- Implement error handling and crash reporting with Sentry.
- Use Reanimated for performant animations.

## Hono (applies to `apps/api/**`)

- Use middleware for authentication and logging.
- Implement route handlers using `app.get`, `app.post`, etc.
- Structure routes modularly.
- Handle errors globally with `app.onError`.
- Use `c.text()`, `c.json()`, and `c.redirect()` for responses.
- Leverage caching with `Cache-Control` or KV storage.

## Next.js (applies to `apps/docs/**`, `apps/web/**`, `apps/app/**`)

- Prioritize server components (RSC) for performance, SEO, and data fetching.
- Use server actions for data mutations.
- Use client components sparingly, only when interactivity is required.
- Never add `"use client"` to `page.tsx`; create a component in `features` instead.
- Use Next.js file-based routing.
- Centralize shared layouts in `layout.tsx`.
- Add `loading.tsx` for loading states; use `Suspense` for nested fetches.
- Implement custom error pages with `error.tsx`.
- Use API route handlers for backend logic within the app structure.
- Optimize SSR and SSG for faster loading.
- Use `nuqs` for URL search parameter state management.

## Testing (applies to `**/*.test.ts`, `**/*.test.tsx`)

- Use Bun testing best practices.
- Add tests to a `__tests__` folder alongside the file under test.
- Import from `bun:test`.
- Use `test`, `describe`, and `expect`.
- `describe` is named after the function under test.
- `test` is named after the case.

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
