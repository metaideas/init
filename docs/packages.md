---
title: Package Guidance
description: Understand init's shared package workspaces, hosted backend package, and key-value storage conventions.
---

Shared libraries and hosted backends live in `packages/`. Apps consume them through
workspace dependencies, and package names follow the project's configured scope.

Use `bun template add package <name>` to restore an available package that was removed
during setup. See [Project structure](./architecture/project-structure.md) for the full package
catalog.

## Convex Backend

`packages/backend` is a hosted backend built with Convex and Better Auth. Apps consume
its generated API types and React client as a workspace package, while Convex deploys
the functions independently.

Use `connect-backend` to add the client, environment, provider, and optional example
wiring to a supported app:

```bash
bun run generate connect-backend --args mobile convex false false
```

See [Project generators](./generators.md) for the supported matrix and generated
ownership. The generator does not deploy Convex or create credentials.

Run `bun run --filter @init/backend dev` to connect the package to a Convex deployment.

### Structure

- `src/client/` — React client and auth adapters
- `src/functions/public/` — public queries and mutations
- `src/functions/private/` — admin-only functions
- `src/functions/system/` — operational functions such as health checks
- `src/functions/shared/` — middleware, auth, logging, and environment configuration
- `src/functions/_generated/` — generated API and data-model types

## Key-Value Storage

`packages/kv` provides key-value storage through
[unstorage](https://unstorage.unjs.io/) and uses its Redis driver by default.

`kv()` lazily returns the shared unstorage `Storage` instance.
`normalizeKey(...parts)` joins key parts with `:`, while `namespaceKey(namespace)`
returns a key helper with that namespace prefix.

Values must be JSON-serializable; dates are returned as strings.

To use another backend, change the driver passed to `createStorage` in
`packages/kv/src/client.ts`.
