# Development

## Common Commands

Here are the most common commands you'll use during development:

- `bun build` - Build all applications
- `bun clean` - Clean build artifacts
- `bun dev` - Start all applications in development mode
- `bun format` - Format code using [Adamantite](https://github.com/adelrodriguez/adamantite)
- `bun lint` - Run linting across the codebase using [Adamantite](https://github.com/adelrodriguez/adamantite)
- `bun typecheck` - Run TypeScript type checking

If you want to run a command for a specific workspace, you can use the following syntax:

```bash
bun <command> --filter <workspace>
```

## Managing Dependencies

- `bun deps:check` - Check for outdated dependencies
- `bun deps:mismatch` - List version mismatches across the monorepo
- `bun deps:sync` - Fix version mismatches automatically
- `bun deps:update` - Update dependencies interactively

## Template Management

- `bun template init` - Initialize project and clean up template files
- `bun template add` - Add workspaces to your monorepo
- `bun template update` - Sync with template updates
- `bun template check` - Check for template updates
- `bun template graph` - Generate dependency graph visualization
