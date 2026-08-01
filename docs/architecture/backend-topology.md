---
title: Backend Topology
description: Choose between TanStack Start, Hono, and Convex backend shapes without coupling every init workspace.
---

init supports three backend shapes without requiring every project to keep all of them.

## TanStack Start

`apps/app` is independently full-stack. Its server routes and server functions are the
smallest backend option when a project only needs the web application. They do not
require `apps/api`.

## Hono API

`apps/api` is an optional Bun-hosted Hono service. It exposes Hono RPC and tRPC clients
from `apps/api/src/client.ts`, the only permitted cross-app import. It also contains the
authenticated Files SDK gateway.

Client applications connect through the local `connect-backend` generator. The
generator owns adapter seams and environment wiring; applications never import source
from `apps/api` outside the exported client contract.

## Convex

`packages/backend` is an optional Convex backend with generated API types and a React
client. It lives in `packages/` because applications consume it as a workspace library,
even though it deploys independently to Convex.

The local `connect-backend` generator adds the client provider and auth wiring to
supported apps. Keeping Convex is an explicit workspace selection and therefore an
explicit hosted-service choice.

## Local defaults

The default application core runs without a hosted account. Local service dependencies
use `infra/local/docker-compose.yml`. Optional backend workspaces and client adapters
should remain removable without leaving imports, environment requirements, or build
failures behind.
