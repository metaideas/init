# Project structure

The project is divided into the following folders:

- `apps` - Cross-platform applications and user-facing products.
- `infra` - Infrastructure as code for local development and cloud providers.
- `packages` - Shared internal packages for use across apps.
- `scripts` - Scripts for random tasks, such as syncing the project with the template and graphing dependencies.
- `tooling` - Shared development configuration and script helpers. If a configuration is used across workspaces and not related to a specific package, it should go here.

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
  │   ├── core                  # Shared core logic and business rules
  │   ├── db                    # Database client and ORM using Drizzle
  │   ├── email                 # Email templating and sending service using Resend
  │   ├── env                   # Environment variable management and validation
  │   ├── kv                    # Redis client database integration using Upstash
  │   ├── observability         # Logging, error tracking, and monitoring using Sentry and Axiom
  │   ├── payments              # Payment processing utilities using Stripe
  │   ├── storage               # Shared storage utilities using UploadThing
  │   ├── ui                    # Reusable UI components and design system using Shadcn/UI
  │   ├── utils                 # Shared helpers and constants for packages and apps
  │   └── workflows             # Background tasks and workflows using Inngest
  │
  ├── scripts             # Scripts for random tasks
  │
  ├── tooling             # Shared development and build tools
  │   ├── internationalization  # Inlang project configuration and translations
  │   ├── tsconfig          # TypeScript configuration
  │   └── helpers           # Common utility functions for tooling and scripts
  │
  └── turbo               # Turborepo configuration for monorepo management
      └── generators        # Code generators for packages and tooling
```

## App structure

Each app has a `src` folder that contains the source code for the app.

Apps are usually organized in three folders:

- The main router (e.g., `app` for Expo, `routes` for TanStack Start and Vite projects).
  - Some projects, like the browser extension, have an extra folder that can be considered part of the routing logic.
- A `shared` folder for shared utilities and components.
- A `features` folder for feature-based modules.

We follow a unidirectional import flow between these three folders. The code only flows downwards to the routing folder, never going upwards. What this means is that the `features` folder can import from the `shared` folder, but the `shared` folder cannot import from the `features` folder. The `app/routing` folder can import from either the features or the shared folder, but never the other way around. This makes the code more organized and easier to understand.

Feature folders are also vertical slices of the app and do not have any dependencies between them. This keeps the code organized and easier to understand. If you find yourself needing to import something from a different feature, you should first consider if it can be moved to the `shared` folder.

### API

This is a high-performance API server built with Hono, providing TRPC endpoints and running on Bun with TypeScript.

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

This is a web application using TanStack Start with authentication and full-stack features.

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

This is a cross-platform mobile application built with Expo and React Native, featuring authentication and native capabilities.

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

This is a cross-platform desktop application built with Tauri, combining a Rust backend with a TanStack Router frontend for native performance.

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

This is a cross-browser web extension built with WXT framework, providing enhanced web browsing capabilities across Chrome, Firefox, and other browsers.

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

This is a documentation website built with Astro and Starlight, providing comprehensive project documentation with search and navigation features.

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

This is a marketing website and blog built with Astro, focusing on static content and SEO optimization.

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

Packages don't have an strict structure. A general guideline is that all runtime code should be in the `src` folder, while scripts should be in the `scripts` folder.

```sh
packages/package-name
  ├── src/                    # Source code
  └── scripts/                # Scripts
```

You can create a new package using the following command:

```sh
bun generate
```

And then selecting the `internal-package` option.
