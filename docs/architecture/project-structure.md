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
  │   ├── core                  # Shared core logic and business rules
  │   ├── db                    # Database client and ORM using Drizzle
  │   ├── email                 # Email templating and sending service using Resend
  │   ├── kv                    # Key-value storage using unstorage with the Redis driver
  │   ├── native-ui             # Reusable React Native UI components
  │   ├── observability         # Wide-event logging with evlog, error tracking and monitoring with Sentry
  │   ├── payments              # Payment processing utilities using Stripe
  │   ├── ui                    # Reusable UI components and design system using Shadcn/UI
  │   ├── utils                 # Shared helpers and constants for packages and apps
  │   └── workflows             # Background tasks and workflows using Inngest
  │
  ├── scripts             # Template commands (bun template setup, rename, add)
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

Every application workspace also owns an `.env.schema` contract and a generated `src/shared/env.generated.ts` binding. See [Environment configuration](../environment.md).

### API

This API server uses Hono and runs on Bun with TypeScript. It provides tRPC endpoints and the Files SDK gateway.

```sh
apps/api
  └── src/                    # Source code
      ├── index.ts              # Entry point to the server
      ├── client.ts             # Hono and tRPC client types for other apps
      ├── instrument.ts         # Error monitoring instrumentation
      │
      ├── routes/               # Routing
      │   ├── index.ts            # Router entrypoint, global middleware, and error handler
      │   ├── files.ts            # Files SDK gateway
      │   ├── health.ts           # Health check
      │   ├── trpc.ts             # tRPC adapter
      │   ├── workflows.ts        # Inngest endpoint
      │   └── v1/                 # Versioned REST routes
      │
      ├── shared/               # Shared utilities and helpers
      │   ├── auth.ts             # Better Auth server instance
      │   ├── files.ts            # Files SDK composition
      │   ├── logger.ts           # Logger instance
      │   ├── middleware.ts       # Reusable middleware
      │   ├── trpc.ts             # tRPC context and procedures
      │   ├── types.ts            # Shared types
      │   └── utils.ts            # General utility functions
      │
      └── features/             # Feature folders
          └── [feature]/          # Specific feature (e.g. auth, demo)
              ├── procedures.ts     # Feature-specific tRPC procedures
              └── functions.ts      # Feature-specific workflow functions
```

### App

This web application uses TanStack Start. It provides authentication and full-stack features.

```sh
apps/app
  ├── src/                    # Source code
  │   ├── routes/               # File-based routing for TanStack Start
  │   │   ├── __root.tsx          # Root route and document shell
  │   │   ├── _unauthenticated/   # Unauthenticated routes (sign in, sign up, etc.)
  │   │   ├── _authenticated/     # Authenticated routes (dashboard, settings, etc.)
  │   │   └── api/                # API routes such as the auth handler
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/             # Static assets shared across the app
  │   │   ├── components/         # Reusable components, providers, error and not-found views
  │   │   ├── server/             # Shared server functions, middleware, and serialization
  │   │   ├── auth.ts             # Authentication client
  │   │   ├── logger.ts           # Logger instance
  │   │   └── utils.ts            # General utility functions
  │   │
  │   ├── features/             # Feature folders
  │   │   └── [feature]/          # Specific feature (e.g. auth, demo, theme)
  │   │       ├── components/       # Feature-specific components
  │   │       ├── server/           # Feature-specific server functions
  │   │       ├── constants.ts      # Feature-specific constants
  │   │       └── validation.ts     # Feature-specific validation schemas
  │   │
  │   ├── router.tsx            # Router factory and context
  │   ├── routeTree.gen.ts      # Generated route tree (committed)
  │   ├── client.tsx            # Browser entry
  │   ├── server.ts             # Server entry
  │   └── start.ts              # TanStack Start instance
  │
  ├── reset.d.ts                # ts-reset type improvements
  └── vite.config.ts            # Vite configuration
```

### Mobile

This mobile application uses Expo and React Native. It provides native capabilities and connects to a backend through the `connect-backend` skill.

```sh
apps/mobile
  ├── src/                    # Source code
  │   ├── app/                  # Expo Router routes
  │   │   ├── _layout.tsx         # Root layout and providers
  │   │   ├── index.tsx           # Home screen
  │   │   └── +not-found.tsx      # Not found screen
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/             # Icons and splash images
  │   │   ├── components/         # Shared components and providers
  │   │   ├── styles/             # Global styles
  │   │   ├── hooks.ts            # Custom React hooks
  │   │   ├── logger.ts           # Logger instance
  │   │   └── query-client.ts     # TanStack Query client
  │   │
  │   ├── features/             # Feature folders, created with bun run generate new-feature
  │   ├── index.ts              # Expo Router entry
  │   └── instrument.ts         # Error monitoring instrumentation
  │
  ├── scripts/codegen.ts        # Paraglide compilation for Metro
  └── app.config.js             # Expo configuration
```

### Desktop

This desktop application uses Electron Forge. It combines an Electron main process with a TanStack Router renderer.

```sh
apps/desktop
  ├── src/                    # Source code
  │   ├── shell/                # Electron main process and preload script
  │   │   ├── main.ts             # Main process
  │   │   └── preload.ts          # Preload script that exposes window.desktop
  │   │
  │   ├── renderer/             # Renderer entry and file-based TanStack Router routes
  │   │   ├── main.tsx            # Renderer entry and router context
  │   │   ├── routes/             # Routes
  │   │   └── routeTree.gen.ts    # Generated route tree (committed)
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── components/         # Shared components, providers, and error view
  │   │   ├── desktop-bridge.ts   # Typed bridge contract between shell and renderer
  │   │   ├── logger.ts           # Logger instance
  │   │   └── query-client.ts     # TanStack Query client
  │   │
  │   └── features/             # Feature folders
  │       └── [feature]/          # Specific feature (e.g. local-files)
  │           ├── components/       # Feature-specific components
  │           └── mutations.ts      # Feature-specific mutations
  │
  ├── forge.config.ts           # Electron Forge configuration
  ├── vite.main.config.ts       # Vite configuration for the main process
  ├── vite.preload.config.ts    # Vite configuration for the preload script
  └── vite.renderer.config.ts   # Vite configuration for the renderer
```

The renderer never imports from `shell`. See [Desktop behavior](./desktop.md).

### Extension

This web extension uses the WXT framework. It runs in Chrome, Firefox, and other browsers.

```sh
apps/extension
  ├── src/                    # Source code
  │   ├── entrypoints/          # WXT entrypoints
  │   │   ├── background.ts       # Background script
  │   │   └── popup/              # Popup entrypoint
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/             # Assets processed by WXT
  │   │   └── logger.ts           # Logger instance
  │   │
  │   └── features/             # Feature folders
  │       └── [feature]/          # Specific feature (e.g. demo)
  │           └── components/       # Feature-specific components
  │
  └── wxt.config.ts             # WXT configuration
```

### Docs

This documentation website uses Astro and Starlight. It reads the root `docs/` folder directly and owns only presentation.

```sh
apps/docs
  ├── src/                    # Source code
  │   ├── pages/                # Custom pages (404)
  │   │
  │   ├── shared/               # Shared utilities and assets
  │   │   ├── components/         # Starlight component overrides
  │   │   ├── styles/             # Global styles
  │   │   ├── constants.ts        # Site constants
  │   │   ├── markdown-links.ts   # Rewrites relative Markdown links to site routes
  │   │   └── utils.ts            # General utility functions
  │   │
  │   ├── content.config.ts     # Content collection that loads root docs/
  │   └── middleware.ts         # Astro middleware
  │
  └── astro.config.ts           # Astro and Starlight configuration
```

### Web

This marketing website and blog use Astro. They use static content and SEO optimization.

```sh
apps/web
  ├── src/                    # Source code
  │   ├── pages/                # Pages
  │   │   ├── [lang]/             # Localized routes
  │   │   │   ├── blog/[slug].astro # Blog posts
  │   │   │   ├── 404.astro         # Not found page
  │   │   │   └── index.astro       # Homepage
  │   │   ├── 404.astro           # Root not found page
  │   │   └── index.astro         # Root redirect page
  │   │
  │   ├── content/              # Content collections
  │   │   └── blog/               # Blog posts by locale
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── components/         # Layout components
  │   │   └── constants.ts        # Site constants
  │   │
  │   ├── features/             # Feature folders
  │   │   └── landing/            # Landing page components and content
  │   │
  │   ├── content.config.ts     # Content collections configuration
  │   └── middleware.ts         # Astro middleware (to enable i18n for static builds)
  │
  └── astro.config.ts           # Astro configuration
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

The `bun run generate code-snippets` command provides optional copy-once package code.
Apply the `connect-backend` skill to connect an application workspace to an existing backend
workspace. See [Project generators](../generators.md) for the generator workflows.
