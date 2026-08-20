---
title: Development
description: Run, build, test, and maintain an init project with Bun, Turbo, and Adamantite.
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
| `bun run dev`          | Start all workspaces on their fixed local ports.      |
| `bun run dev:apps`     | Start application workspaces.                         |
| `bun run dev:packages` | Start package workspaces.                             |
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

## Development Servers

Each HTTP-serving workspace runs its framework command directly as its `dev` script on a fixed local port. Each application declares its port as the `PORT` default in its `.env.schema`, and its framework configuration reads `ENV.PORT`:

| Workspace         | URL                     |
| ----------------- | ----------------------- |
| API               | `http://localhost:3000` |
| App               | `http://localhost:3001` |
| Mobile server     | `http://localhost:3002` |
| Desktop frontend  | `http://localhost:3003` |
| Docs              | `http://localhost:3004` |
| Extension server  | `http://localhost:3005` |
| Web               | `http://localhost:3006` |
| Drizzle Studio    | `https://local.drizzle.studio` |
| Email preview     | `http://localhost:4001` |
| Inngest           | `http://localhost:4002` |

Package development servers use the 4000 block in alphabetical order: `db` on `4000`, `email` on `4001`, and `workflows` on `4002`. The Inngest development server polls the API workflows endpoint at `http://localhost:3000/workflows`. Drizzle Studio's local server listens on `http://localhost:4000` and the interface opens at `https://local.drizzle.studio`.

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
