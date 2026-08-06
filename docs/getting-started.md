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

5. Start the development servers with Portless:

```bash
bun run dev
```

Portless serves local HTTP development servers through named HTTPS URLs. On its first use, it creates a local certificate authority. It asks the operating system to trust the authority. It starts its proxy on port 443. The project scope sets the hostname suffix. The template uses these names by default:

- App: `https://app.init.localhost`
- API: `https://api.init.localhost`
- Web: `https://web.init.localhost`
- Docs: `https://docs.init.localhost`
- Mobile server: `https://mobile.init.localhost`
- Desktop frontend: `https://desktop.init.localhost`
- Extension server: `https://extension.init.localhost`
- Drizzle Studio: `https://db.init.localhost`
- Email preview: `https://email.init.localhost`
- Inngest: `https://workflows.init.localhost`

`bun template setup` or a root `bun template rename` changes `init` in these hostnames to the normalized project scope. The application workspace uses the `app` subdomain.

Every HTTP-serving workspace uses `portless` as its `dev` script. Each workspace keeps its framework command in `dev:app`. For example, `bun run dev` in `apps/api` serves `https://api.init.localhost`. At the repository root, the same command runs all workspaces through Turbo. The package-local Portless configuration keeps both entry points on the same names.

### First Run Checklist

- Run `bun template setup`.
- Generate source files and types with `bun run codegen`.
- Start services with `bun run docker:up`.
- Start the named HTTPS development topology with `bun run dev`.
- If a local URL or certificate is unavailable, run `portless doctor`.

### Port Allocation

Portless assigns an available upstream port to each application workspace and package UI at startup. The public HTTPS names stay stable when two projects run at the same time. Separate projects must use different npm scopes. This prevents public-name conflicts. Git worktrees receive automatic route prefixes. Use `portless list` to examine the current assignments.

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
- For Portless trust or DNS problems, run `portless doctor`. Then run its suggested `portless trust` or `portless hosts sync` command.
- `.localhost` is available only on the development machine. Expo on a physical device
  requires Portless LAN mode and a `.local` hostname.
