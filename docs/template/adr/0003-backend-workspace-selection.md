# 0003: Select backend alternatives as workspaces

## Status

Accepted

## Decision

Keep the Hono API in `apps/api` and Convex in `packages/backend`, and let scaffold owners
select either workspace. `apps/app` remains independently full-stack through TanStack
Start server routes and functions.

Convex belongs in `packages/` because applications consume its generated API and React
client as a library even though the backend deploys separately. Client connections are
added through the local `connect-backend` generator.

## Consequences

No backend workspace is mandatory for every surface. Dependency closure keeps required
shared packages, and omitting a backend removes its account and environment
requirements cleanly.
