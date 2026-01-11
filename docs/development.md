# Development

## Tooling Requirements

See `docs/getting-started.md` for the authoritative versions. In short:

- Bun `1.3.x`
- Node.js `>=24`

## Commands

These match the root `package.json` scripts.

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `bun run dev`          | Start all workspaces in development mode     |
| `bun run dev:apps`     | Start app workspaces in development mode     |
| `bun run dev:packages` | Start package workspaces in development mode |
| `bun run build`        | Build all workspaces                         |
| `bun run clean`        | Clean build artifacts                        |
| `bun run check`        | Run Adamantite checks                        |
| `bun run fix`          | Auto-fix issues with Adamantite              |
| `bun run format`       | Format code with Adamantite                  |
| `bun run typecheck`    | Type-check all workspaces                    |
| `bun run test`         | Run the test suite                           |
| `bun run docker:up`    | Start local services                         |
| `bun run docker:down`  | Stop local services                          |
| `bun run boundaries`   | Generate dependency boundaries report        |

If you want to run a command for a specific workspace, you can use the following syntax:

```bash
bun run <command> --filter <workspace>
```

## Managing Dependencies

- `bun run bump:deps` - Update dependencies interactively
- `bun run analyze` - Detect unused dependencies and files
- `bun run check:monorepo` - Validate monorepo rules
- `bun run fix:monorepo` - Auto-fix monorepo issues

## Template Management

- `bun run init:setup` - Initialize project and clean up template files
- `bun run init:add:app` - Add an app workspace
- `bun run init:add:package` - Add a package workspace
- `bun run init:update` - Sync with template updates
- `bun run init:check` - Check for template updates
- `bun run init:rename` - Rename project and update references
