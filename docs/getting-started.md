---
title: Getting Started
description: Create an init project, select its workspaces, and start the local development environment.
sidebar:
  order: 2
---

## Prerequisites

- Use [bun](https://bun.sh/) as the package manager.
- Install Node.js. See the tooling requirements below.
- Install Docker to run the database and Redis. Use [OrbStack](https://orbstack.dev/) to manage containers.

## Tooling Expectations

- Bun: `1.3.x` (matches `package.json` `packageManager`)
- Node.js: `>=24` (matches `package.json` `engines`)

## Create a Project

```bash
bun create metaideas/init my-app
cd my-app
```

## Setup

1. Install the dependencies with `bun`:

```bash
bun install
```

2. Configure the template:

```bash
bun template setup
```

The command does the following:

- It lets you select the workspaces to include.
- It renames the project and updates all imports.
- It initializes a Git repository when necessary.
- It removes the internal template files.
- It installs the dependencies.

### Choosing Workspaces

`template setup` prompts first for application workspaces and then for package workspaces. Add workspaces later with `bun template add app <name>` or `bun template add package <name>`.

### Choosing a Backend

- Keep the TanStack Start server routes and functions in `apps/app` for a full-stack web application without a separate backend deployment.
- Keep `packages/backend` when clients such as `apps/mobile` need Convex real-time data, managed functions, and a hosted database.
- Keep `apps/api` for a self-managed Hono service, OpenAPI routes, or infrastructure control.

These are alternatives, not layers that every project must run. Application workspaces connect to a backend explicitly. No client connects to `packages/backend` by default.

After you select a backend alternative, connect an application workspace with the backend generator:

```bash
bun run generate connect-backend
```

See [Project generators](./generators.md) for supported combinations and command-line examples. The generator configures local connections. It does not deploy a backend or create external credentials.

3. Generate source files and types:

```bash
bun run codegen
```

Application contracts are in `.env.schema`. Safe local values are committed in `.env.development`. Put personal overrides in `.env.local`. Then run `bun run env:check`. See [Environment configuration](./environment.md) for package contracts, production values, and secret stores.

4. Start the local services with `docker`:

```bash
bun run docker:up
```

5. Start the development servers:

```bash
bun run dev
```

Each workspace serves on a fixed local port. Application workspaces declare the port as the `PORT` default in their `.env.schema`; the Mobile server and package development servers set theirs in their `dev` scripts:

- API: `http://localhost:3000`
- App: `http://localhost:3001`
- Mobile server: `http://localhost:3002`
- Desktop frontend: `http://localhost:3003`
- Docs: `http://localhost:3004`
- Extension server: `http://localhost:3005`
- Web: `http://localhost:3006`
- Drizzle Studio: `https://local.drizzle.studio?port=4000` (local server on `4000`)
- Email preview: `http://localhost:4001`
- Inngest: `http://localhost:4002`

At the repository root, `bun run dev` runs all workspaces through Turbo. Inside a workspace, the same command starts that workspace alone.

### First Run Checklist

- Run `bun template setup`.
- Generate source files and types with `bun run codegen`.
- Start services with `bun run docker:up`.
- Start the development servers with `bun run dev`.

#### Infrastructure Ports

Docker infrastructure uses fixed host ports. These ports can conflict across projects:

- Redis: `8000`
- Database: `8001`
- Minio: `8002` (S3), `8003` (console)

### Troubleshooting

- For a Bun version mismatch, run `bun --version`. Update to `1.3.x`.
- For a Node version mismatch, install Node.js `>=24` with the version manager.
- When Docker services do not run, examine `docker ps`. Then run `bun run docker:up`.
- For missing environment variables, run `bun run env:check`. Then examine the owning `.env.schema` and the ignored `.env.local` overrides.
- For a port conflict, find the process with `lsof -i :<port>`. Application workspace ports are the `PORT` defaults in their `.env.schema`; the Mobile server and package development servers set theirs in their `dev` scripts.
- Expo on a physical device requires the development machine's LAN IP instead of `localhost`.
