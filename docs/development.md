---
title: Development
description: Run, build, test, and maintain an init project with Bun, Turbo, and Adamantite.
sidebar:
  order: 3
---

## Tooling Requirements

See [Getting Started](./getting-started.md) for the required versions. Use these versions:

- Bun `1.4.x`
- Node.js `>=24`

## Commands

These commands match the scripts in the root `package.json`.

| Command                | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `bun run dev`          | Start all workspaces on their fixed local ports.                     |
| `bun run dev:apps`     | Start application workspaces.                                        |
| `bun run dev:packages` | Start package workspaces.                                            |
| `bun run build`        | Build all workspaces.                                                |
| `bun run start`        | Run the `start` task of each workspace.                              |
| `bun run clean`        | Remove build artifacts.                                              |
| `bun run check`        | Run Adamantite lint, format, and type checks.                        |
| `bun run fix`          | Apply safe lint fixes and format code.                               |
| `bun run analyze`      | Detect unused dependencies, files, and exports.                      |
| `bun run codegen`      | Generate workspace source and environment types.                     |
| `bun run env:check`    | Validate Varlock workspaces in parallel.                             |
| `bun run env:scan`     | Build client artifacts and scan for sensitive values.                |
| `bun run test`         | Run the test suite.                                                  |
| `bun run test:watch`   | Run the test suite in watch mode.                                    |
| `bun run db:push`      | Push the Drizzle schema to the database.                             |
| `bun run db:migrate`   | Run the Drizzle migrations.                                          |
| `bun run docker:up`    | Start the local services.                                            |
| `bun run docker:down`  | Stop the local services.                                             |
| `bun run boundaries`   | Check Turborepo package boundaries.                                  |
| `bun run generate`     | Run a template recipe with Turbo generators.                         |
| `bun template`         | Run a template command (`setup`, `doctor`, `add`, `remove`, `diff`). |
| `bun run scripts`      | Run the project script entry point.                                  |

To run a command for one workspace, use this syntax:

```bash
bun run <command> --filter <workspace>
```

Application workspaces separate generation into `codegen:*` scripts. `codegen:env` generates environment types and `codegen:i18n` compiles the Paraglide messages. Mobile compiles the messages with `scripts/codegen.ts` so Metro receives the strategy it needs. The Extension also has `codegen:types`, which runs `wxt prepare`. Docs and Web also have `codegen:types`, which runs `astro sync`. `astro sync` compiles the Paraglide messages again through the Vite plugin in `astro.config.ts`, so these workspaces use `codegen:astro` to run `codegen:i18n` and then `codegen:types` in sequence. Only one process writes the message output at a time, and the output of the Vite plugin is the final result. Keep the `--strategy` value of `codegen:i18n` the same as the `strategy` in `astro.config.ts`. The `codegen` script of a workspace runs its `codegen:*` scripts at the same time with Bun's parallel script runner. Turbo keeps one dependency boundary. You can run a `codegen:*` script on its own during development. Run `bun run codegen` after you clone the repository, create a worktree, or install dependencies.

## Development Servers

Each HTTP-serving workspace runs its framework command directly as its `dev` script on a fixed local port. Application workspaces declare the port as the `PORT` default in their `.env.schema`, and their framework configuration reads `ENV.PORT`. The Mobile server and the package development servers set theirs with a `${PORT:-<port>}` fallback in the `dev` script:

| Workspace        | URL                                      |
| ---------------- | ---------------------------------------- |
| API              | `http://localhost:3000`                  |
| App              | `http://localhost:3001`                  |
| Mobile server    | `http://localhost:3002`                  |
| Desktop frontend | `http://localhost:3003`                  |
| Docs             | `http://localhost:3004`                  |
| Extension server | `http://localhost:3005`                  |
| Web              | `http://localhost:3006`                  |
| Drizzle Studio   | `https://local.drizzle.studio?port=4000` |
| Email preview    | `http://localhost:4001`                  |
| Inngest          | `http://localhost:4002`                  |

Package development servers use the 4000 block in alphabetical order: `db` on `4000`, `email` on `4001`, and `workflows` on `4002`. The Inngest development server polls the API workflows endpoint at `http://localhost:3000/workflows`. Drizzle Studio's local server listens on `http://localhost:4000`; open the interface at `https://local.drizzle.studio?port=4000`, since the bare hosted URL connects to Drizzle's default port instead.

## Managing Dependencies

- `bun run bump:deps` - Update dependencies interactively across workspaces.
- `bun run analyze` - Detect unused dependencies, files, and exports.

## Template Management

- `bun template setup` - Configure the project and record its template version.
- `bun template doctor` - Verify workspace selection, environment contracts, and tooling.
- `bun template add <kind> <name>` - Add a workspace from the template at the recorded commit.
- `bun template remove <kind> <name>` - Delete a workspace and list what still references it.
- `bun template diff` - Show upstream template changes since the recorded commit.
- `bun run scripts` - Run the extensible entry point for scripts that the project owns.

The skills in `.agents/skills/` drive these commands. See [Template commands](./template-commands.md).
