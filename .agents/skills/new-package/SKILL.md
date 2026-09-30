---
name: new-package
description: Create a package workspace under packages/ that owns one domain. Use when the user asks for a new shared package, a new integration package, or code that several application workspaces will share.
---

A package workspace owns its constants, types, dependencies, and environment fragments. Scaffold it with the Turbo generator, then fill in the domain.

1. Check that no existing package owns the domain. `@<scope>/utils` is only for helpers several workspaces use and no package owns.
2. Scaffold:

   ```bash
   bun run generate new-package
   ```

   It creates `packages/<name>` with the project scope, the shared tsconfig preset, and the `#*` imports field.

3. Add the third-party dependency behind the package with `bun add` inside the package. Export a small surface from `src/index.ts` and subpaths in `package.json` `exports`.
4. If the package needs environment variables, add `env/.env.server` or `env/.env.client`, an `.env.schema` that imports them with `@generateTsTypes`, and a `codegen` script that runs `varlock codegen`. Consumers import the fragment from their `.env.schema`.
5. Add the package as a `workspace:*` dependency of each consumer, run `bun install`, then `bun template doctor`. Finish when it passes.
