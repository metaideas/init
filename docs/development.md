---
title: Development
description: Run, build, test, and maintain an init project with Bun, Turbo, Adamantite, and Portless.
sidebar:
  order: 3
---

## Tooling Requirements

See [Getting Started](./getting-started.md) for the required versions. Use these versions:

- Bun `1.3.x`
- Node.js `>=24`

## Commands

These commands match the scripts in the root `package.json`.

| Command                | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `bun run dev`          | Start all workspaces with named HTTPS URLs.           |
| `bun run dev:apps`     | Start the application workspace dev servers.          |
| `bun run dev:packages` | Start the package workspace dev servers.              |
| `bun run build`        | Build all workspaces.                                 |
| `bun run clean`        | Remove build artifacts.                               |
| `bun run check`        | Generate types and run Adamantite checks.             |
| `bun run codegen`      | Generate workspace source and environment types.      |
| `bun run env:check`    | Validate Varlock workspaces in parallel.              |
| `bun run env:scan`     | Build client artifacts and scan for sensitive values. |
| `bun run fix`          | Correct issues with Adamantite.                       |
| `bun run format`       | Format code with Adamantite.                          |
| `bun run test`         | Run the test suite.                                   |
| `bun run docker:up`    | Start the local services.                             |
| `bun run caddy:trust`  | Trust the local Caddy certificate authority.          |
| `bun run docker:down`  | Stop the local services.                              |
| `bun run boundaries`   | Generate the report for dependency boundaries.        |

To run a command for one workspace, use this syntax:

```bash
bun run <command> --filter <workspace>
```

Application workspaces separate generation into `codegen:env` and `codegen:i18n`. Their `codegen` script runs both commands at the same time with Bun's parallel script runner. Turbo keeps one dependency boundary. You can run either generator independently during development.

## Local HTTPS Proxy

A Caddy service in `infra/local/docker-compose.yml` serves the HTTP development servers through named HTTPS URLs on port 443. `infra/local/Caddyfile` maps each hostname to the fixed port of its development server. The normalized npm scope sets the hostname suffix. For a scope named `example`, the application workspace uses `https://app.example.localhost`. The API uses `https://api.example.localhost`. Other HTTP development servers use `<workspace>.example.localhost`. Browsers resolve `.localhost` hostnames to the loopback interface without configuration. `bun template setup` and `bun template rename` rewrite the hostnames in the Caddyfile together with the environment files.

`bun run docker:up` starts the proxy with the other local services. On its first start, Caddy creates a local certificate authority under `infra/local/.data/caddy`. Run `bun run caddy:trust` once to install that authority in the operating system trust store. Until then, browsers warn about the HTTPS names. Because the proxy binds ports 80 and 443 on the host, only one project can run its local stack at a time. The Caddyfile disables the Caddy admin endpoint; restart the service with `docker compose restart caddy` after editing routes.

On macOS and Windows, the Caddy container publishes ports 80 and 443 and reaches the development servers through Docker Desktop's `host.docker.internal`. On Linux, `bun run docker:up` layers `infra/local/docker-compose.linux.yml`, which joins Caddy to the host network and points `host.docker.internal` at the loopback interface, because firewalls commonly drop traffic from the Docker bridge to the host.

Each HTTP-serving workspace runs its framework command directly as its `dev` script on a fixed port: API `3000`, App `3001`, Docs `3004`, Web `3006`, Drizzle Studio `4983`, React Email `4000`, and Inngest `8288`. Inngest runs from `packages/workflows`.

The Mobile (`3002`), Desktop (`3003`), and Extension (`3005`) development servers are not proxied. Expo, Electron, and the browser-extension tooling consume them directly on their localhost ports. `.localhost` resolves only on the development machine. Physical devices must use the Expo LAN URL.

## Managing Dependencies

- `bun run bump:deps` - Update dependencies interactively.
- `bun run analyze` - Detect unused dependencies and files.
- `bun run check:monorepo` - Validate monorepo rules.
- `bun run fix:monorepo` - Correct monorepo issues automatically.

## Template Management

- `bun template setup` - Configure the project and record its template version.
- `bun template rename` - Rename the project and update package scope references.
- `bun template add app <name>` - Add an application workspace from the template.
- `bun template add package <name>` - Add a package workspace from the template.
- `bun run scripts` - Run the extensible entry point for scripts that the project owns.

An agent applies template updates. See [Updating your project](./template-commands.md#updating-your-project).
