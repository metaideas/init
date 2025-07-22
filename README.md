<p align="center">
  <h1 align="center">▶︎ <code>init</code></h1>

  <p align="center">
    <em><strong>Start once, ship everything.</strong></em>
  </p>
</p>

A modern monorepo template for shipping TypeScript apps everywhere: web, mobile, desktop, and more.

## What's included

- Fullstack application using [Next.js](https://nextjs.org/) and [TRPC](https://trpc.io/)
- Documentation site using [Fumadocs](http://fumadocs.vercel.app)
- Marketing site and blog using [Next.js](https://nextjs.org/) and [Content Collections](https://www.content-collections.dev/)
- Mobile application using [Expo](https://expo.dev/)
- API using [Hono](https://hono.dev/)
- Desktop application using [Tauri](https://tauri.app/)
- Browser extension using [WXT](https://wxt.dev/)

## Prerequisites

- We use [bun](https://bun.sh/) as our package manager.
- You'll need Nodejs v22 or higher installed.
- You'll need Docker installed for running the database and Redis. I recommend using [OrbStack](https://orbstack.dev/) for managing your containers.

## Getting started

1. Install the dependencies using `bun`:

```bash
bun install
```

2. Start your local services using `docker`.

```bash
bun docker:up
```

3. Run the `setup` script:

```bash
bun workspace:setup
```

This will:

- Let you choose the workspaces you want to include
- Rename the project and update all the imports
- Setup environment files from templates
- Setup a remote template branch for syncing updates

If you later want to add or remove workspaces, you can use the following commands:

```bash
bun workspace:add # Adds a workspace from the template to the project
bun workspace:remove # Removes a workspace from the project
```

4. Start the development server:

```bash
bun dev # or bun dev --filter <workspace> to start a specific workspace
```

### Ports

#### Apps

Apps run in the 3000-3999 range.

- API: `3000`
- App: `3001`
- Mobile: `3002`
- Desktop: `3003`
- Extension: `3004`
- Docs: `3005`
- Web: `3006`

#### Packages

Packages run in the 8000-8999 range.

- Redis: `8079`
- Database: `8080`
- Email: `8081`
- Queue: `8288`

## Development

### Common Commands

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

### Managing Dependencies

- `bun deps:check` - Check for outdated dependencies
- `bun deps:graph` - Generate a dependency graph visualization
- `bun deps:mismatch` - List version mismatches across the monorepo
- `bun deps:sync` - Fix version mismatches automatically
- `bun deps:update` - Update dependencies interactively

## Documentation

- [Project Structure](./docs/project-structure.md)
