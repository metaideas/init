---
title: Backend Topology
description: Choose among TanStack Start, Hono, and Convex backend shapes without coupling all workspaces in init.
---

init supports three backend shapes. A Scaffolded project does not require all three backend shapes.

## TanStack Start

`apps/app` is independently full-stack. Its server routes and functions provide the
smallest backend option when a Scaffolded project only needs the web application. They do not
require `apps/api`.

## Hono API

`apps/api` is an optional Hono service. It runs on Bun and exposes Hono RPC and tRPC
clients from `apps/api/src/client.ts`. Application workspaces can import only this file
from another Application workspace. It also contains the authenticated Files SDK gateway.

Run the local `connect-backend` generator to connect client Application workspaces. The generator
owns adapter seams and environment wiring. Application workspaces never import source
from `apps/api` outside the exported client contract.

## Convex

`packages/backend` is an optional Convex backend with API types that Convex generates and
a React client. It exists in `packages/` because Application workspaces consume it as a
workspace library. It deploys independently to Convex.

Run the local `connect-backend` generator to add the client provider and authentication
wiring to supported Application workspaces. When you select Convex, you explicitly select
a workspace and a hosted service.

## Local defaults

The default application core runs without a hosted account. Local service dependencies
use `infra/local/docker-compose.yml`. Optional backend workspaces and client adapters
must remain removable. Their removal must not leave imports, environment requirements, or
build failures.
