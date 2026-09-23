---
name: new-feature
description: Create a feature folder inside an application workspace. Use when the user asks for a new feature, screen, flow, or vertical slice in apps/app, apps/desktop, apps/mobile, or apps/extension.
---

Features live in `src/features/<name>` and import only `shared` and dependencies, never another feature. Scaffold the folder, then implement.

1. Scaffold:

   ```bash
   bun run generate new-feature
   ```

   Pick the app and the files the feature needs. It skips files that exist.

2. Implement in this order: `validation.ts` schemas in PascalCase, `server/functions.ts` or `queries.ts` for data, `hooks.ts` for state, then components. Delete scaffolded files the feature does not use.
3. Mount the feature from a route or entrypoint. Routes import features; features never import routes.
4. Run `bun template doctor --fast`, fix what it reports, then finish with `bun template doctor`.
