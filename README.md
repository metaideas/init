<p align="center">
  <h1 align="center">🧬 <code>init</code></h1>

  <p align="center">
    <em><strong>Start once, ship everything.</strong></em>
  </p>
</p>

An opinionated monorepo starter kit for building apps everywhere: web, mobile, desktop, and more.

## What's included

- Web application using [Next.js](https://nextjs.org/)
- Documentation site using [Fumadocs](http://fumadocs.vercel.app)
- Mobile application using [Expo](https://expo.dev/)
- API using [Hono](https://hono.dev/) running on Node.js
- Desktop application using [Tauri](https://tauri.app/)
- Browser extension using [WXT](https://wxt.dev/)

## Prerequisites

- We use [pnpm](https://pnpm.io/) as our package manager.
- You'll need Nodejs v22 or higher installed.
- You'll need Docker installed for running the database and Redis. I recommend using [OrbStack](https://orbstack.dev/) for managing your containers.

## Getting started

1. Install the dependencies using `pnpm`:

```bash
pnpm install
```

2. Start your local services using `docker`.

```bash
pnpm docker:up
```

3. Run the `setup-env` script to create the environment files:

```bash
pnpm env:setup
```

4. Start the development server:

```bash
pnpm dev
```

Since this monorepo has a lot of applications and packages you may not need for your project, you can run the `setup-template` script to select which workspaces you want to keep:

```bash
pnpm template:setup
```

If you later want to add or remove workspaces, you can use the following commands:

```bash
pnpm workspace:add # Adds a workspace from the template to the project
pnpm workspace:remove # Removes a workspace from the project
```

### Ports

#### Apps

Apps run in the 3000-3999 range.

- API: 3000
- App: 3001
- Mobile: 3002
- Desktop: 3003
- Extension: 3004
- Docs: 3005
- Web: 3006

#### Packages

Packages run in the 8000-8999 range.

- Redis: 8079
- Database: 8080
- Email: 8081
- Queue: 8288

## Development

### Common Commands

Here are the most common commands you'll use during development:

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Run linting across the codebase using Biome
- `pnpm format` - Format code using Biome
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run linting and formatting
- `pnpm clean` - Clean build artifacts
- `pnpm clean:all` - Deep clean (build artifacts, cache, node_modules)

If you want to run a command for a specific workspace, you can use the following syntax:

```bash
pnpm <command> --filter <workspace>
```

### Managing Dependencies

- `pnpm deps:check` - Check for outdated dependencies
- `pnpm deps:update` - Update dependencies interactively
- `pnpm deps:mismatch` - List version mismatches across the monorepo
- `pnpm deps:sync` - Fix version mismatches automatically
- `pnpm deps:graph` - Generate a dependency graph visualization

## Documentation

- [Project Structure](./.docs/project-structure.md)
