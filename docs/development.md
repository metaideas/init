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
| `bun run dev:apps`     | Start application workspaces with Portless.           |
| `bun run dev:packages` | Start package workspaces with Portless.               |
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
| `bun run docker:down`  | Stop the local services.                              |
| `bun run boundaries`   | Generate the report for dependency boundaries.        |

To run a command for one workspace, use this syntax:

```bash
bun run <command> --filter <workspace>
```

Application workspaces separate generation into `codegen:env` and `codegen:i18n`. Their `codegen` script runs both commands at the same time with Bun's parallel script runner. Turbo keeps one dependency boundary. You can run either generator independently during development.

## Portless

Every HTTP-serving workspace uses `portless` as its `dev` script. Each workspace keeps its framework command in `dev:app`, as [Portless recommends for Turborepo](https://portless.sh/configuration). Root commands such as `bun run dev` and local commands such as `cd apps/api && bun run dev` use named HTTPS URLs. The normalized npm scope sets the hostname suffix. For a scope named `example`, the application workspace uses `https://example.localhost`. The API uses `https://api.example.localhost`. Other HTTP development servers use `<workspace>.example.localhost`.

The package-local `portless` object in each HTTP-serving workspace defines its project-qualified name and `dev:app` script. Portless assigns an available upstream port at runtime. Multiple projects can run at the same time without shared application ports. Separate projects must use distinct npm scopes and Portless names. Git worktrees receive automatic route prefixes.

Drizzle Studio, React Email, and the Inngest development server use the same package-local pattern. Inngest runs from `packages/workflows`. Docker Compose is reserved for data infrastructure.

The first run can request administrator access to trust the local Portless certificate authority and bind port 443. Use `portless doctor` to examine the proxy, certificate, DNS, and route health.

Portless routes the Mobile, Desktop, and Extension development servers. It does not replace Expo, Tauri, or browser-extension launch behavior. `.localhost` resolves only on the development machine. Physical devices require Portless LAN mode and `.local`.

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
