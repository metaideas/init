# 0003: Select backend alternatives as workspaces

## Status

Accepted

## Decision

Keep the Hono API in `apps/api` and Convex in `packages/backend`. Let scaffold owners
select either workspace. `apps/app` remains independently full-stack through TanStack
Start server routes and functions.

Convex belongs in `packages/` because application workspaces consume its generated API and React
client as a library, even though the backend deploys separately. The local `connect-backend` template command adds client connections.

## Consequences

No application workspace requires a backend workspace. Dependency closure retains required
package workspaces. When a scaffold owner omits a backend alternative, it removes the related account and environment
requirements.
