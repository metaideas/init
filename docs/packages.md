---
title: Package Guidance
description: Understand the shared package workspaces, hosted backend package, and key-value storage conventions in init.
---

Shared libraries and hosted backends are in `packages/`. Application workspaces consume them through workspace dependencies. Package names use the configured scope of the project.

Use `bun template add package <name>` to restore an available package workspace that setup removed. See [Project structure](./architecture/project-structure.md) for the full package catalog.

## Convex Backend

`packages/backend` is a hosted backend built with Convex and Better Auth. Application workspaces consume its generated API types and React client as a package workspace. Convex deploys the functions independently.

Use `connect-backend` to add the client, environment, provider, and optional example connections to a supported application workspace:

```bash
bun run generate connect-backend --args mobile convex false false
```

See [Project generators](./generators.md) for the supported matrix and generated ownership. The template command does not deploy Convex or create credentials.

Run `bun run --filter @init/backend dev` to connect the package to a Convex deployment.

### Structure

- `src/client/` — React client and auth adapters
- `src/functions/public/` — public queries and mutations
- `src/functions/private/` — admin-only functions
- `src/functions/system/` — operational functions such as health checks
- `src/functions/shared/` — middleware, auth, logging, and environment configuration
- `src/functions/_generated/` — generated API and data-model types

## Key-Value Storage

`packages/kv` provides key-value storage through [unstorage](https://unstorage.unjs.io/). By default, it uses the Redis driver of unstorage.

`kv()` returns the shared unstorage `Storage` instance when code first requests it. `normalizeKey(...parts)` joins key parts with `:`. `namespaceKey(namespace)` returns a key helper with the namespace prefix.

Values must be JSON-serializable. The storage returns dates as strings.

To use another backend, change the driver passed to `createStorage` in `packages/kv/src/client.ts`.
