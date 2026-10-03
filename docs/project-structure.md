---
title: Project Structure
description: Navigate the application, package, infrastructure, and tooling workspaces in init and their import boundaries.
---

The template has the following folders:

- `apps` - Application workspaces for multiple platforms and user-facing products.
- `infra` - Infrastructure code for local development and cloud providers.
- `packages` - Shared internal package workspaces for application workspaces. Backends on hosted platforms, such as Convex, also exist here. Application workspaces consume them as libraries. They deploy independently.
- `tooling` - Shared configuration for development and helpers for scripts. Put configuration here when workspaces use it and it does not relate to a specific package workspace.

## General monorepo structure

```sh
root
  ├── apps                # Cross-platform applications
  │   ├── app               # TanStack Start web application
  │   ├── api               # Hono API with RPC client running on Bun
  │   ├── desktop           # Electron desktop application with TanStack Router
  │   ├── docs              # Astro Starlight documentation site
  │   ├── extension         # WXT browser extension
  │   ├── mobile            # Expo mobile application
  │   └── web               # Astro marketing site and blog
  │
  ├── infra               # Infrastructure as code for cloud providers
  │   └── local             # Docker Compose configuration for local development
  │
  ├── packages            # Shared internal packages for use across apps
  │   ├── ai                    # AI model provider registry using the AI SDK
  │   ├── analytics             # Web and product analytics
  │   ├── auth                  # Authentication utilities using Better Auth
  │   ├── backend               # Convex backend, generated API types, and React client
  │   ├── core                  # Shared business logic and errors, organized by domain
  │   ├── database              # Database client and ORM using Drizzle
  │   ├── email                 # Email templating and sending service using Resend
  │   ├── kv                    # Key-value storage using unstorage with the Redis driver
  │   ├── observability         # Wide-event logging with evlog, error tracking and monitoring with Sentry
  │   ├── payments              # Payment processing utilities using Stripe
  │   ├── ui                    # Reusable UI components and design system using Shadcn/UI
  │   ├── utils                 # Shared helpers and constants for packages and apps
  │   └── workflows             # Durable background workflows using DBOS
  │
  ├── scripts             # Template commands (bun template setup, doctor, add, remove, diff)
  │
  ├── tooling             # Shared development and build tools
  │   ├── internationalization  # Inlang project configuration and translations
  │   └── tsconfig              # TypeScript configuration
  │
  └── turbo               # Turborepo configuration for monorepo management
      └── generators        # Template recipes that bun run generate applies
```

## App structure

Each application workspace has a `src` folder. It contains the source code for the application workspace.

Application workspaces usually use three folders:

- The main router, such as `app` for Expo, `routes` for TanStack Start and TanStack Router, `pages` for Astro, or `entrypoints` for WXT.
- A `shared` folder for utilities and components.
- A `features` folder for vertical slices of the product.

These folders have a one-way import flow. The `features` folder can import from the `shared` folder. The `shared` folder cannot import from the `features` folder. The router folder can import from the `features` or `shared` folder. Neither folder can import from the router folder. This flow organizes the code and makes it easier to understand.

Feature folders are vertical slices in an application workspace. A feature folder does not depend on another feature folder. Before you import an item from another feature, determine if the `shared` folder can contain it.

`bun run check` enforces these flows, and covers a new feature folder without a configuration change. Routes use relative imports only for style and image assets; they reach every other module through a `#` subpath.

When an application workspace has more than one entrypoint tier, such as a desktop main process and a renderer, the tiers never import each other. They communicate through a typed contract in `shared`.

Every application workspace also owns an `.env.schema` contract and a generated `src/shared/env.generated.ts` binding. See [Environment configuration](./environment.md).

Each application workspace below follows this layout. The trees show the folders that differ between frameworks; look inside a workspace for its current files.

### API

A Hono server on Bun. It serves tRPC, versioned REST routes, background workflow endpoints, and the Files SDK gateway. `src/client.ts` is the only module that other application workspaces can import.

```sh
apps/api/src
  ├── routes/       # Hono routes; routes can compose other routes
  ├── shared/       # Auth, middleware, tRPC context, and service composition
  ├── features/     # Feature folders
  ├── client.ts     # Typed client for other apps
  └── index.ts      # Server entry point
```

### App

A full-stack TanStack Start web application.

```sh
apps/app/src
  ├── routes/       # File-based routes, grouped by authentication state
  ├── shared/       # Components, server middleware, and app-wide utilities
  ├── features/     # Feature folders with components/, server/, and schemas.ts
  └── router.tsx    # Router factory and context
```

### Mobile

An Expo and React Native application.

```sh
apps/mobile/src
  ├── app/          # Expo Router routes
  ├── shared/       # Components, styles, and app-wide utilities
  └── features/     # Feature folders
```

### Desktop

An Electron Forge application with a TanStack Router renderer.

```sh
apps/desktop/src
  ├── shell/        # Electron main process and preload script
  ├── renderer/     # Renderer entry and file-based routes
  ├── shared/       # Components, utilities, and the typed shell-renderer bridge
  └── features/     # Feature folders
```

### Extension

A WXT browser extension.

```sh
apps/extension/src
  ├── entrypoints/  # WXT entrypoints such as background and popup
  ├── shared/       # Assets and utilities
  └── features/     # Feature folders
```

### Docs

An Astro Starlight site. It reads the root `docs/` folder directly and owns only presentation.

```sh
apps/docs/src
  ├── pages/              # Custom pages
  ├── shared/             # Component overrides, styles, and utilities
  └── content.config.ts   # Content collection that loads root docs/
```

### Web

An Astro marketing site and blog.

```sh
apps/web/src
  ├── pages/        # Localized pages
  ├── content/      # Content collections, such as blog posts by locale
  ├── shared/       # Layout components and constants
  └── features/     # Feature folders
```

## Package structure

Package workspaces do not have a strict structure. A general guideline places all runtime code in the `src` folder. It places scripts in the `scripts` folder.

```sh
packages/package-name
  ├── src/                    # Source code
  └── scripts/                # Scripts
```

Run the following command to create a new package workspace:

```sh
bun run generate new-package
```

Apply the `connect-backend` skill to connect an application workspace to an existing backend
workspace. See [Project generators](./generators.md) for the generator workflows.
