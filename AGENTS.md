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

## Template decisions

These decisions govern the template. When new work contradicts one, state the conflict in the pull request and update this list in the same change. Do not change a decision silently.

1. **Packages and template recipes are different things.** A package workspace is an ongoing dependency with third-party dependencies and a lifecycle. A template recipe is code the scaffold owner copies once and edits directly. Payments, AI, analytics, key-value storage, and email clients are package workspaces. Email templates, small utilities, environment presets, UI additions, and authentication snippets are template recipes.
2. **No external accounts by default.** The integrated core needs no hosted service, API key, or external account. Local development works with only the repository and its Docker Compose services. Hosted capabilities are explicit workspace or template command selections, and their absence must not leave required environment variables, imports, or failed builds.
3. **Backend alternatives are workspaces.** The Hono API is `apps/api` and Convex is `packages/backend`. `apps/app` is independently full-stack through TanStack Start. No application workspace requires a backend workspace. Convex lives in `packages/` because application workspaces consume its generated API and React client as a library, even though it deploys separately. The `connect-backend` skill adds client connections.
4. **`apps/web` is both the public `init.now` site and the Astro marketing example.** Hosting independence is a deployment concern. It does not need a second source tree, lockfile, or dependency graph.
5. **The Files SDK gateway is part of `apps/api`, and clients are generated.** The gateway uses Bun's S3 adapter with local MinIO defaults, session authentication, per-user object prefixes, content-type limits, and upload size limits. Application clients are optional and come from the `files-client` template command. A change to accepted content, size limits, key scoping, or authentication changes the security policy; record it here.
6. **`apps/docs` is both the public documentation site and the Starlight example.** Root `docs/` owns authored Markdown and MDX. The docs application owns presentation only and reads root documents directly with Astro's content loader. It publishes the top-level guides, `docs/architecture/`, and `docs/es/`. It does not copy or synchronize another content tree.
7. **Varlock owns environment contracts.** Package workspaces own reusable fragments under `env/` (`.env.shared`, `.env.client`, `.env.server`, `.env.build`). Application workspaces own complete `.env.schema` contracts and import only the fragments they consume. Committed `.env.development` files hold safe local values, ignored `.env.local` files override them, and deployment platforms own preview and production values. Global environment augmentation stays disabled. Convex is an independent boundary: backend functions declare their variables in `convex.config.ts` and Varlock does not synchronize secrets into Convex. Plain deployment-platform secrets are the default; 1Password is the documented optional secret store, and the template contains no vault or item identifiers.

<!-- TEMPLATE:END -->

## Skills

Template work runs through the skills in `.agents/skills/`. Each skill states which template command or Turbo generator does the mechanical part and ends with `bun template doctor`; a passing doctor is the definition of done for setup, workspace changes, backend connections, and template updates. Reach for `setup`, `add-workspace`, `remove-workspace`, `connect-backend`, `new-package`, `new-feature`, `update-from-template`, or `doctor` before editing those areas by hand.

## Architecture

Before you explore or change code, read the relevant document under `docs/architecture/`. Use the same vocabulary in issues, plans, code, and documentation. Before you add a term, verify that it names a real distinction.

Domain terms:

- **Asset**: a file in storage with a stable identity. Other records can refer to it. An Asset has one Owner and records the Uploader.
- **Asset Owner**: the User to whom an Asset belongs. Ownership can differ from who created it.
- **Asset Uploader**: the User who puts an Asset in managed storage. The Uploader is not always the Owner.

## Coding standards

### TypeScript style

- Write concise, technical TypeScript.
- Use functional and declarative patterns.
- Prefer `type` to `interface`.
- Avoid enums.
- Use `readonly` arrays or maps with `as const`.
- Use the `function` keyword for pure functions and components.
- Use descriptive names.
- Name runtime validation schema constants in PascalCase, such as `UserIdSchema`.
- Use auxiliary verbs for state and behavior.
- Use lowercase kebab-case names for directories and files.
- Favor default exports for components.
- Do not use a default export when a module exports multiple functions.
- Put exported components first. Then put subcomponents, helpers, static content, and types.

### Imports and boundaries

- Use `#` subpath imports within a package. They resolve from its `src` directory.
- Use `@init/*` to import another workspace package.
- Do not import between apps. Only `apps/api/src/client.ts` can be imported by another app.
- Within an app, imports flow `shared` → `features` → routes and entrypoints:
  - `shared` imports only dependencies and other `shared` modules.
  - A feature can import `shared`, but not another feature.
  - Routes and entrypoints can import `shared` and features, but not other routes. A route file can `import type` the router context from its entrypoint.
  - `apps/api` routes can import other routes for Hono composition.
  - In `apps/desktop`, `shell` (the Electron main process and preload script) and `renderer` are both entrypoint tiers. The renderer never imports `#shell`. It reaches native behavior only through the typed `window.desktop` bridge.
- Avoid circular imports.

### UI

- Use `@init/ui` for the web UI and `@init/native-ui` for the mobile UI. Import one component per subpath, for example `@init/native-ui/components/button`.
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

### Commits

- Use a conventional commit message (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `build:`, `ci:`, `revert:`, `release:`, `deps:`, `wip:`, `breaking:`, `deprecate:`).

## Workspace notes

- `apps/api`: use Hono middleware for authentication and logging, modular route handlers, `app.onError` for global errors, and Hono response helpers.
- `apps/mobile`: use functional React components, Expo APIs, Expo Router for navigation, Expo for assets, and Reanimated for performance-sensitive animation.
- `apps/docs`: never duplicate the root `docs/` content tree or add a sync command. Add a page under a published root `docs/` path with `title` and `description` frontmatter, then add it to the sidebar in `astro.config.ts`.
- `packages/db`: use Drizzle, the shared prefixed-ID helper, and timestamps where appropriate.
- `packages/backend`: keep Convex functions in `public/`, `private/`, `system/`, and `shared/`. Do not edit `_generated/`.
- `packages/native-ui`: components are copy-owned source from the React Native Reusables Uniwind registry. After `components:add`, move files from `src/components/ui/` to `src/components/` and re-apply the repository conventions.

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
