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

5. Trust the local certificate authority, then start the development servers:

```bash
bun run caddy:trust
bun run dev
```

A Caddy container from `infra/local/docker-compose.yml` serves the local HTTP development servers through named HTTPS URLs on port 443. On its first start, it creates a local certificate authority under `infra/local/.data/caddy`. `bun run caddy:trust` asks the operating system to trust that authority. The project scope sets the hostname suffix. The template maps these names in `infra/local/Caddyfile`:

- App: `https://app.init.localhost` (port `3001`)
- API: `https://api.init.localhost` (port `3000`)
- Web: `https://web.init.localhost` (port `3006`)
- Docs: `https://docs.init.localhost` (port `3004`)
- Drizzle Studio: `https://db.init.localhost` (port `4983`)
- Email preview: `https://email.init.localhost` (port `4000`)
- Inngest: `https://workflows.init.localhost` (port `8288`)

`bun template setup` or a root `bun template rename` changes `init` in these hostnames to the normalized project scope. The application workspace uses the `app` subdomain.

Every HTTP-serving workspace runs its framework command as its `dev` script on its fixed port. For example, `bun run dev` in `apps/api` serves port `3000`, which Caddy publishes as `https://api.init.localhost`. At the repository root, the same command runs all workspaces through Turbo. The Mobile (`3002`), Desktop (`3003`), and Extension (`3005`) development servers are not proxied; Expo, Electron, and the browser-extension tooling consume them directly on their localhost ports.

### First Run Checklist

- Run `bun template setup`.
- Generate source files and types with `bun run codegen`.
- Start services with `bun run docker:up`.
- Trust the local certificate authority with `bun run caddy:trust`.
- Start the named HTTPS development topology with `bun run dev`.

### Port Allocation

Each development server owns a fixed port, and `infra/local/Caddyfile` maps the public HTTPS names onto those ports. Because the Caddy proxy binds ports 80 and 443 and the servers bind fixed ports, only one project created from this template can run its local stack at a time.

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
- For certificate warnings on the `.localhost` HTTPS names, run `bun run caddy:trust` after `bun run docker:up`, then restart the browser. On Linux, Chrome and Firefox keep their own certificate stores; the script installs into the NSS user database when `certutil` is available.
- When an HTTPS name does not respond, confirm the Caddy container runs with `docker ps` and that the workspace development server runs on the port listed in `infra/local/Caddyfile`.
- `.localhost` is available only on the development machine. Browsers resolve it without configuration; command-line tools may need an `/etc/hosts` entry. Expo on a physical device must use the Expo LAN URL.
