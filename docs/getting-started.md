---
title: Getting Started
description: Create an init project, select its workspaces, and start the local development environment.
sidebar:
  order: 2
---

## Prerequisites

- We use [bun](https://bun.sh/) as our package manager.
- You'll need Node.js installed (see tooling expectations below).
- You'll need Docker installed for running the database and Redis. I recommend using [OrbStack](https://orbstack.dev/) for managing your containers.

## Tooling Expectations

- Bun: `1.3.x` (matches `package.json` `packageManager`)
- Node.js: `>=24` (matches `package.json` `engines`)

## Create a Project

```bash
bun create metaideas/init my-app
cd my-app
```

## Setup

1. Install the dependencies using `bun`:

```bash
bun install
```

2. Configure the template:

```bash
bun template setup
```

This will:

- Let you choose the workspaces you want to include
- Rename the project and update all the imports
- Initialize a Git repository if needed
- Clean up internal template files
- Install dependencies

### Choosing Workspaces

`template setup` prompts for apps first, then packages. Later, add workspaces with `bun template add app <name>` or `bun template add package <name>`.

### Choosing a Backend

- Keep the TanStack Start server routes and functions in `apps/app` for a full-stack web
  app with no separate backend deployment.
- Keep `packages/backend` when clients such as `apps/mobile` benefit from Convex
  realtime data, managed functions, and a hosted database.
- Keep `apps/api` when you want a self-managed Hono service, OpenAPI routes, or
  infrastructure control.

These are alternatives, not layers every project must run. Apps connect to a backend
explicitly; no client is wired to `packages/backend` by default.

Once you have chosen, connect an app with the backend generator:

```bash
bun run generate connect-backend
```

See [Project generators](./generators.md) for supported combinations and command-line
examples. The generator configures local wiring but does not deploy a backend or create
external credentials.

3. Generate source files and types:

```bash
bun run codegen
```

Application contracts live in `.env.schema`, with safe committed local values in
`.env.development`. Put personal overrides in `.env.local`, then run
`bun run env:check`. See [Environment configuration](./environment.md) for package
contracts, production values, and secret stores.

4. Start your local services using `docker`:

```bash
bun run docker:up
```

5. Start the development servers through Portless:

```bash
bun run dev
```

Portless serves local HTTP development servers over named HTTPS URLs. On first use it
creates a local certificate authority, asks the operating system to trust it, and
starts its proxy on port 443. The project scope determines the hostname suffix; the
default template uses:

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

Running `bun template setup` or a root `bun template rename` changes `init` in these
hostnames to the normalized project scope. The App uses the `app` subdomain.

Every HTTP-serving workspace uses `portless` as its `dev` script and keeps its
framework command in `dev:app`. Running `bun run dev` inside `apps/api`, for example,
serves `https://api.init.localhost`. At the repository root, the same command runs all
workspaces through Turbo. Package-local Portless configuration keeps both entry points
on the same names.

### First Run Checklist

- Run `bun template setup`
- Generate source files and types with `bun run codegen`
- Start services with `bun run docker:up`
- Start the named HTTPS development topology with `bun run dev`
- Run `portless doctor` if a local URL or certificate is unavailable

### Port Allocation

Portless assigns an available upstream port to each application and package UI when it
starts. The public HTTPS names stay stable even when two projects run simultaneously.
Separate projects must use different npm scopes so their public names do not collide;
Git worktrees receive automatic route prefixes. Use `portless list` to inspect the
current assignments.

#### Infrastructure Ports

Docker infrastructure retains fixed host ports and can still conflict across projects:

- Redis: `8000`
- Database: `8001`
- Minio: `8002` (S3), `8003` (console)

### Troubleshooting

- Bun version mismatch: run `bun --version`, update to `1.3.x`.
- Node version mismatch: install Node.js `>=24` with your version manager.
- Docker services not running: check `docker ps`, then run `bun run docker:up`.
- Missing environment variables: run `bun run env:check`, then inspect the owning
  `.env.schema` and your ignored `.env.local` overrides.
- Portless trust or DNS problems: run `portless doctor`, then follow its suggested
  `portless trust` or `portless hosts sync` command.
- `.localhost` is available only on the development machine. Expo on a physical device
  requires Portless LAN mode and a `.local` hostname.
