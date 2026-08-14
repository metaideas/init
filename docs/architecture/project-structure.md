---
title: Project Structure
description: Navigate the Application, Package, infrastructure, and tooling workspaces in init and their import boundaries.
---

The Template has the following folders:

- `apps` - Application workspaces for multiple platforms and user-facing products.
- `infra` - Infrastructure code for local development and cloud providers.
- `packages` - Shared internal Package workspaces for Application workspaces. Backends on hosted platforms, such as Convex, also exist here. Application workspaces consume them as libraries. They deploy independently.
- `tooling` - Shared configuration for development and helpers for scripts. Put configuration here when workspaces use it and it does not relate to a specific Package workspace.

## General monorepo structure

```sh
root
  ├── apps                # Cross-platform applications
  │   ├── app               # TanStack Start web application
  │   ├── api               # Hono API with RPC client running on Bun
  │   ├── desktop           # Tauri desktop application with TanStack Router
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
  │   ├── kv                    # Redis client database integration using Upstash
  │   ├── native-ui             # Reusable React Native UI components
  │   ├── observability         # Wide-event logging with evlog, error tracking and monitoring with Sentry
  │   ├── payments              # Payment processing utilities using Stripe
  │   ├── ui                    # Reusable UI components and design system using Shadcn/UI
  │   ├── utils                 # Shared helpers and constants for packages and apps
  │   └── workflows             # Background tasks and workflows using Inngest
  │
  ├── tooling             # Shared development and build tools
  │   ├── internationalization  # Inlang project configuration and translations
  │   └── tsconfig              # TypeScript configuration
  │
  └── turbo               # Turborepo configuration for monorepo management
      └── generators        # Code generators for packages and tooling
```

## App structure

Each Application workspace has a `src` folder. It contains the source code for the Application workspace.

Application workspaces usually use three folders:

- The main router, such as `app` for Expo or `routes` for TanStack Start and Vite projects.
  - The browser extension has an additional folder. It forms part of the routing logic.
- A `shared` folder for utilities and components.
- A `features` folder for modules by feature.

These folders have a one-way import flow. The `features` folder can import from the `shared` folder. The `shared` folder cannot import from the `features` folder. The `app/routing` folder can import from the `features` or `shared` folder. Neither folder can import from the `app/routing` folder. This flow organizes the code and makes it easier to understand.

Feature folders are vertical slices in an Application workspace. A feature folder does not depend on another feature folder. This structure organizes the code and makes it easier to understand. Before you import an item from another feature, determine if the `shared` folder can contain it.

### API

This API server uses Hono and runs on Bun with TypeScript. It provides TRPC endpoints.

```sh
apps/api
  └── src/                    # Source code
      ├── index.ts              # Entry point to the worker
      ├── client.ts             # Hono and TRPC client type to be used in other apps
      ├── instrument.ts         # Error monitoring instrumentation
      │
      ├── routes/               # Routing
      │   ├── index.tsx           # Router entrypoint
      │   └── ...                 # Other routes
      │
      ├── shared/               # Shared utilities and helpers
      │   ├── middleware.ts       # Global middleware
      │   ├── constants.ts        # Constant values and enums
      │   ├── env.ts              # Environment variables
      │   ├── types.ts            # Shared types
      │   └── utils.ts            # General utility functions
      │
      └── features/             # Feature based modules
          └──[feature]/           # Specific feature (e.g. auth, dashboard, settings)
              ├── router.ts         # Feature-specific router
              ├── procedures.ts     # Feature-specific procedures
              ├── types.ts          # Feature-specific types
              ├── utils.ts          # Feature-specific utilities
              └── validation.ts     # Feature-specific validation schemas
```

### App

This web application uses TanStack Start. It provides authentication and full-stack features.

```sh
apps/app
  ├── src/                    # Source code
  │   ├── routes/               # File-based routing for TanStack Start
  │   │   ├── (unauthenticated)/ # Unauthenticated routes (sign in, sign up, etc.)
  │   │   ├── (authenticated)/   # Authenticated routes (dashboard, settings, etc.)
  │   │   └── api/               # API routes
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/             # Static assets shared across the app (images, icons, etc.)
  │   │   ├── auth/               # Authentication client and helpers
  │   │   ├── components/         # Reusable components
  │   │   ├── hooks/              # Custom React hooks
  │   │   ├── server/             # Server-side code
  │   │   │   ├── middleware.ts       # Global middleware
  │   │   │   └── functions.ts        # Shared server functions for data fetching and mutations
  │   │   ├── stores/             # Global state management stores
  │   │   ├── styles/             # Global styles
  │   │   ├── env.ts              # Environment variable configuration
  │   │   ├── constants.ts        # Constant values and enums
  │   │   ├── types.ts            # TypeScript type definitions
  │   │   ├── utils.ts            # General utility functions
  │   │   └── validation.ts       # Form and data validation schemas
  │   │
  │   ├── features/             # Feature-based modules
  │   │   └──[feature]/           # Specific feature (e.g., auth, dashboard, settings)
  │   │       ├── assets/           # Feature-specific assets
  │   │       ├── components/       # Feature-specific components
  │   │       ├── server/           # Feature-specific server functions
  │   │       │   ├── middleware.ts       # Feature-specific middleware
  │   │       │   └── functions.ts        # Feature-specific server functions for data fetching and mutations
  │   │       ├── hooks.ts          # Feature-specific custom hooks
  │   │       ├── stores.ts         # Feature-specific state stores
  │   │       ├── types.ts          # Feature-specific type definitions
  │   │       ├── utils.ts          # Feature-specific utility functions
  │   │       └── validation.ts     # Feature-specific validation schemas
  │   │
  │   └── instrumentation.ts    # Monitoring and analytics instrumentation
  │
  └── global.d.ts               # Global TypeScript declarations
```

### Mobile

This mobile application uses Expo and React Native. It provides authentication and native capabilities.

```sh
apps/mobile
  ├── src/                    # Source code
  │   ├── app/                  # App router
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/            # Static assets shared across the app
  │   │   ├── styles/            # Global styles
  │   │   ├── components/        # Shared components used across the entire app
  │   │   ├── hooks.ts           # Custom React hooks
  │   │   ├── i18n.ts            # Internationalization setup
  │   │   ├── stores.ts          # Global state stores
  │   │   ├── auth.ts            # Authentication client and helpers
  │   │   ├── api.ts             # Global API and query client
  │   │   ├── constants.ts       # Constant values and enums
  │   │   ├── env.ts             # Environment variables
  │   │   ├── types.ts           # Shared types
  │   │   ├── utils.ts           # Shared utilities for the app
  │   │   └── validation.ts      # Shared validation schemas
  │   │
  │   └── features/             # Feature based modules
  │       └──[feature]/           # Specific feature (e.g. auth, dashboard, settings)
  │           ├── assets/          # Feature-specific assets
  │           ├── components/      # Feature-specific components
  │           ├── hooks.ts         # Feature-specific hooks
  │           ├── mutations.ts     # Feature-specific mutations
  │           ├── queries.ts       # Feature-specific queries
  │           ├── stores.ts        # Feature-specific global state stores
  │           ├── types.ts         # Feature-specific types
  │           ├── utils.ts         # Feature-specific utilities
  │           └── validation.ts    # Feature-specific validation schemas
  │
  └── app.config.ts             # Expo configuration
```

### Desktop

This desktop application uses Tauri. It combines a Rust backend with a TanStack Router frontend for native performance.

```sh
apps/desktop
  └── src/                    # Source code
      ├── routes/               # File-based routing for TanStack Router
      │
      ├── shared/               # Shared utilities and helpers
      │   ├── assets/            # Static assets shared across the app
      │   ├── styles/            # Global styles
      │   ├── components/        # Shared components used across the entire app
      │   ├── auth.ts            # Authentication client and helpers
      │   ├── hooks.ts           # Custom React hooks
      │   ├── stores.ts          # Global state stores
      │   ├── api.ts             # Global API and query client
      │   ├── constants.ts       # Constant values and enums
      │   ├── env.ts             # Environment variables
      │   ├── types.ts           # Shared types
      │   ├── utils.ts           # Shared utilities for the app
      │   └── validation.ts      # Shared validation schemas
      │
      └── features/             # Feature based modules
          └──[feature]/           # Specific feature (e.g. auth, dashboard, settings)
              ├── assets/          # Feature-specific assets
              ├── components/      # Feature-specific components
              ├── hooks.ts         # Feature-specific hooks
              ├── mutations.ts     # Feature-specific mutations
              ├── queries.ts       # Feature-specific queries
              ├── stores.ts        # Feature-specific global state stores
              ├── types.ts         # Feature-specific types
              ├── utils.ts         # Feature-specific utilities
              └── validation.ts    # Feature-specific validation schemas
  │
```

### Extension

This web extension uses the WXT framework. It provides enhanced web browsing capabilities in Chrome, Firefox, and other browsers.

```sh
apps/extension
  ├── src/                    # Source code
  │   ├── entrypoints/          # Entrypoints
  │   │   ├── popup/              # Popup entrypoint
  │   │   ├── background/         # Background script entrypoint
  │   │   └── ...                 # Other entrypoints
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/            # Assets processed by WXT
  │   │   ├── styles/            # Global styles
  │   │   ├── components/        # Shared components used across the entire extension
  │   │   ├── services/          # Shared services
  │   │   ├── stores/            # Global state stores
  │   │   ├── api.ts            # Global API and query client
  │   │   ├── auth.ts           # Authentication client and helpers
  │   │   ├── constants.ts      # Constant values and enums
  │   │   ├── env.ts            # Environment variables
  │   │   ├── hooks.ts          # Shared hooks
  │   │   ├── i18n.ts           # Internationalization
  │   │   ├── types.ts          # Shared types
  │   │   ├── utils.ts          # Shared utilities for the app
  │   │   └── validation.ts     # Shared validation schemas
  │   │
  │   └── features/             # Feature based modules
  │       └──[feature]/           # Specific feature (e.g. auth, dashboard, settings)
  │           ├── assets/          # Feature-specific assets
  │           ├── components/      # Feature-specific components
  │           ├── hooks/         # Feature-specific hooks
  │           ├── mutations.ts     # Feature-specific mutations
  │           ├── queries.ts       # Feature-specific queries
  │           ├── services.ts      # Feature-specific services
  │           ├── stores.ts        # Feature-specific global state stores
  │           ├── types.ts         # Feature-specific types
  │           ├── utils.ts         # Feature-specific utilities
  │           └── validation.ts    # Feature-specific validation schemas
  │
  └── public/                 # Static assets not processed by WXT. Includes the extension icon.
```

### Docs

This documentation website uses Astro and Starlight. It provides project documentation with search and navigation features.

```sh
apps/docs
  ├── src/                    # Source code
  │   ├── content/              # Documentation content
  │   │   └── docs/             # Documentation pages
  │   │       ├── .../         # Other documentation pages
  │   │       ├── [/lang]/      # Localized routes
  │   │       │   ├── .../      # Localized pages
  │   │       │   └── index.mdx # Localized homepage
  │   │       └── index.mdx     # Homepage
  │   │
  │   ├── shared/               # Shared utilities and assets
  │   │   ├── assets/           # Images and static files
  │   │   ├── components/       # Reusable components
  │   │   ├── i18n.ts           # Internationalization setup
  │   │   ├── stores.ts         # Global state stores
  │   │   ├── auth.ts           # Authentication client and helpers
  │   │   ├── api.ts            # Global API and query client
  │   │   └── styles/           # Global styles
  │   │
  │   └── content.config.ts     # Content collection configuration
  │
  ├── public/                   # Static assets
  └── astro.config.ts           # Astro and Starlight configuration
```

### Web

This marketing website and blog use Astro. They use static content and SEO optimization.

```sh
apps/web
  ├── src/                    # Source code
  │   ├── pages/                # Pages
  │   │   ├── [lang]/              # Localized routes
  │   │   │   ├── .../             # Other pages
  │   │   │   │   └── [slug].astro # Dynamic pages
  │   │   │   ├── 404.astro        # Not found page
  │   │   │   └── index.astro      # Homepage
  │   │   └── index.astro          # Root redirect page
  │   │
  │   ├── content/              # Content collections
  │   │   └── .../                # Other content collections
  │   │       ├── [/lang]/        # Localized routes
  │   │       │   ├── .../        # Localized pages
  │   │       │   └── index.mdx   # Localized homepage
  │   │       └── index.mdx       # Homepage
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── components/         # Reusable components
  │   │   │   └── layout.astro    # Main layout component
  │   │   └── env.ts              # Environment variable configuration
  │   │
  │   ├── content.config.ts     # Content collections configuration
  │   └── middleware.ts         # Astro middleware (to enable i18n for static builds)
```

## Package structure

Package workspaces do not have a strict structure. A general guideline places all runtime code in the `src` folder. It places scripts in the `scripts` folder.

```sh
packages/package-name
  ├── src/                    # Source code
  └── scripts/                # Scripts
```

Run the following command to create a new Package workspace:

```sh
bun run generate new-package
```

The `bun run generate code-snippets` command provides optional copy-once package code.
Run `connect-backend` to connect an Application workspace to an existing backend workspace. See
[Project generators](../generators.md) for both workflows.
