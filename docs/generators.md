---
title: Project Generators
description: Use local template recipes to add features, package workspaces, and optional integrations.
---

Run `bun run generate` to open the Turbo generator menu. Template commands use local template recipes from the exact template snapshot in the project. They do not download a catalog. They do not update previously generated files. They do not track template drift.

`turbo/generators/config.ts` registers each implementation in `turbo/generators/commands`. Put generated source in Handlebars files under `templates/`. Keep each template command direct and self-contained. Do not add shared recipe, adapter, or utility layers.

## Create project scaffolds

`new-feature` creates selected files under the `src/features` directory of an application workspace:

```bash
bun run generate new-feature
```

`new-package` creates a workspace under `packages/`. It uses the current npm scope, shared TypeScript configuration, and TypeScript version of the project:

```bash
bun run generate new-package
```

Both scaffold template commands preserve existing files on a repeat run.

## Connect a backend

Backend connections are not a generator. The `connect-backend` skill in `.agents/skills/connect-backend/` carries the supported connections, their environment keys, and reference sources. A coding agent applies it and verifies the result with `bun template doctor`.

## Add a Files SDK client

`apps/api` includes an authenticated Files SDK gateway. Its access policy (authentication, key scoping, accepted content types, and upload size) lives in the gateway composition in `apps/api/src/shared/`. Treat a change to that policy as a security change and review it as one.

Generate the optional client in an application workspace that consumes the API:

```bash
bun run generate files-client
```

The template command can target any workspace under `apps/` and asks for the Files SDK endpoint. It creates an application-local module in `src/shared/` that exports authenticated React hooks for uploads, downloads, listings, and searches. A repeat run reports skips without replacing generated application code.

## Add the AI chat demo

`ai-chat-demo` adds a scripted AI SDK chat that needs no model, API key, or network:

```bash
bun run generate ai-chat-demo
```

The template command adds a demo feature to an application workspace and the dependency on the AI package workspace. Render the generated component in a route. To use a real model, keep the chat interface and replace the scripted transport with one backed by a server route that uses the AI package's model registry.

The demo uses full Zod in the browser. Adding it gives up the bundle savings of Zod Mini on every route, because the two share Zod's core modules. A repeat run reports skips without replacing generated application code.
