<div align="center">
  <h1 align="center"><code>@init/backend</code></h1>
</div>

Hosted backend package built with [Convex](https://convex.dev/) and Better Auth. It lives in
`packages/` because apps consume its generated API types and React client like a library, while
Convex deploys the functions independently.

## Choosing a backend

- Keep the TanStack Start server routes and functions in `apps/app` for an independently
  full-stack web app with no separate backend deployment.
- Keep `packages/backend` when a client such as `apps/mobile` benefits from Convex realtime data,
  managed functions, and a hosted database.
- Keep `apps/api` when you want a self-managed Hono service, OpenAPI routes, or infrastructure
  control.

These are alternatives, not layers that every project must run. Apps connect to a backend
explicitly; no client is wired to `packages/backend` by default.

## Development

Run `bun run --filter @init/backend dev` to connect the package to a Convex deployment.

## Structure

- `src/client/` — React client and auth adapters exported to consuming apps
- `src/functions/public/` — public queries and mutations
- `src/functions/private/` — admin-only functions
- `src/functions/system/` — operational functions such as health checks
- `src/functions/shared/` — Convex middleware, auth, logging, and environment configuration
- `src/functions/_generated/` — generated Convex API and data-model types
