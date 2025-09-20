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
  │   ├── app               # Next.js web application
  │   ├── api               # Hono API with RPC client running on Node.js
  │   ├── desktop           # Tauri desktop application with Next.js
  │   ├── docs              # Documentation site
  │   ├── extension         # WXT browser extension
  │   ├── mobile            # Expo mobile application
  │   └── web               # Astro marketing site and blog
  │
  ├── infra               # Infrastructure as code for cloud providers
  │   └── local             # Docker Compose configuration for local development
  │
  ├── packages            # Shared internal packages for use across apps
  │   ├── ai                # AI utilities
  │   ├── analytics         # Web and product analytics
  │   ├── auth              # Authentication utilities using Better Auth (depends on: utils)
  │   ├── core              # Shared core logic and business rules
  │   ├── db                # Database client and ORM using Drizzle (depends on: env, utils)
  │   ├── email             # Email templating and sending service using Resend
  │   ├── env               # Environment variable management and validation
  │   ├── feature-flags     # Feature flag utilities for managing and toggling features
  │   ├── internationalization # Internationalization utilities and translation files
  │   ├── kv                # Redis client and vector database integration using Upstash
  │   ├── observability     # Logging, error tracking, and monitoring using Sentry and Axiom
  │   ├── payments          # Payment processing utilities using Stripe
  │   ├── queue             # Serverless job queue and workflow management using Upstash
  │   ├── security          # Security utilities and best practices using Arcjet (depends on: kv)
  │   ├── storage           # Shared storage utilities using UploadThing
  │   ├── ui                # Reusable UI components and design system using Shadcn/UI (depends on: utils)
  │   └── utils             # Shared helpers and constants for packages and apps
  │
  ├── scripts             # Scripts for random tasks
  │
  ├── tooling             # Shared development and build tools
  │   ├── tsconfig          # TypeScript configuration
  │   └── helpers           # Common utility functions for tooling and scripts
  │
  └── turbo               # Turborepo configuration for monorepo management
      └── generators        # Code generators for packages and tooling
```

## App structure

Each app has a `src` folder that contains the source code for the app.

Apps are usually organized in three folders:

- The main router (e.g., `app` for Next.js and Expo, `routes` for Vite projects).
  - Some projects, like the browser extension, have an extra folder that can be considered part of the routing logic.
- A `shared` folder for shared utilities and components.
- A `features` folder for feature-based modules.

We follow a unidirectional import flow between these three folders. The code only flows downwards to the routing folder, never going upwards. What this means is that the `features` folder can import from the `shared` folder, but the `shared` folder cannot import from the `features` folder. The `app/routing` folder can import from either the features or the shared folder, but never the other way around. This makes the code more organized and easier to understand.

Feature folders are also vertical slices of the app and do not have any dependencies between them. This keeps the code organized and easier to understand. If you find yourself needing to import something from a different feature, you should first consider if it can be moved to the `shared` folder.

### App

This is a web application using Next.js with authentication and full-stack features.

```sh
apps/app
  ├── src/                    # Source code
  │   ├── app/                  # App router for Next.js
  │   │   ├── (unauthenticated)/ # Unauthenticated routes (sign in, sign up, etc.)
  │   │   ├── (authenticated)/   # Authenticated routes (dashboard, settings, etc.)
  │   │   └── api/               # API routes
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/               # Static assets shared across the app (images, icons, etc.)
  │   │   ├── auth/               # Authentication client and helpers
  │   │   ├── components/         # Reusable components
  │   │   ├── hooks/              # Custom React hooks
  │   │   ├── i18n/               # Internationalization setup
  │   │   ├── middlewares/        # Global middleware to be imported into middleware.ts
  │   │   ├── server/             # Server-side code
  │   │   │   ├── data/               # Data access layer (e.g., database queries)
  │   │   │   ├── loaders.ts          # Shared data fetching functions for server components
  │   │   │   └── actions.ts          # Shared server actions for handling form submissions and mutations
  │   │   ├── stores/             # Global state management stores
  │   │   ├── env.ts              # Environment variable configuration
  │   │   ├── constants.ts        # Constant values and enums
  │   │   ├── safe-action.ts      # Type-safe server actions client and middleware
  │   │   ├── types.ts            # TypeScript type definitions
  │   │   ├── utils.ts            # General utility functions
  │   │   └── validation.ts       # Form and data validation schemas
  │   │
  │   ├── features/             # Feature-based modules
  │   │   └──[feature]/           # Specific feature (e.g., auth, dashboard, settings)
  │   │       ├── assets/           # Feature-specific assets
  │   │       ├── components/       # Feature-specific components
  │   │       ├── actions.ts        # Feature-specific server actions
  │   │       ├── hooks.ts          # Feature-specific custom hooks
  │   │       ├── loaders.ts        # Feature-specific data loaders
  │   │       ├── stores.ts         # Feature-specific state stores
  │   │       ├── types.ts          # Feature-specific type definitions
  │   │       ├── utils.ts          # Feature-specific utility functions
  │   │       └── validation.ts     # Feature-specific validation schemas
  │   │
  │   ├── middleware.ts         # Next.js middleware for request/response modification
  │   └── instrumentation.ts    # Monitoring and analytics instrumentation
  │
  ├── translations              # Internationalization translation files
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
  │   │   │   └── styles/          # Global styles
  │   │   ├── components/        # Shared components used across the entire app
  │   │   ├── auth/             # Authentication client and helpers
  │   │   ├── hooks/            # Custom React hooks
  │   │   ├── i18n/             # Internationalization setup
  │   │   ├── stores/           # Global state stores
  │   │   ├── api.ts            # Global API and query client
  │   │   ├── constants.ts      # Constant values and enums
  │   │   ├── env.ts            # Environment variables
  │   │   ├── types.ts          # Shared types
  │   │   ├── utils.ts          # Shared utilities for the app
  │   │   └── validation.ts     # Shared validation schemas
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
  └── translations            # Translations files
```

### API

This is a high-performance API server built with Hono, providing RPC endpoints and running on Node.js with TypeScript.

```sh
apps/api
  └── src/                    # Source code
      ├── index.ts              # Entry point to the worker
      ├── client.ts             # RPC client type to be used in other apps
      ├── routes/               # Routing
      │   ├── index.tsx           # Router entrypoint
      │   └── ...                 # Other routes
      │
      ├── shared/               # Shared utilities and helpers
      │   ├── middlewares/        # Global middleware
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

### Desktop

This is a cross-platform desktop application built with Tauri, combining a Rust backend with a Next.js frontend for native performance.

```sh
apps/desktop
  ├── src/                    # Source code
  │   ├── app/                  # Entry point to the desktop app
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/            # Static assets shared across the app
  │   │   │   └── styles/          # Global styles
  │   │   ├── components/        # Shared components used across the entire app
  │   │   ├── auth/             # Authentication client and helpers
  │   │   ├── hooks/            # Custom React hooks
  │   │   ├── i18n/             # Internationalization setup
  │   │   ├── stores/           # Global state stores
  │   │   ├── api.ts            # Global API and query client
  │   │   ├── constants.ts      # Constant values and enums
  │   │   ├── env.ts            # Environment variables
  │   │   ├── types.ts          # Shared types
  │   │   ├── utils.ts          # Shared utilities for the app
  │   │   └── validation.ts     # Shared validation schemas
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
  ├── translations            # Translations files
  └── content                 # Blog and other static content
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
  │   │   │   └── styles/          # Global styles
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

This is a documentation website built with Next.js and Fumadocs, providing comprehensive project documentation with search and navigation features.

```sh
apps/docs
  ├── src/                    # Source code
  │   ├── app/                  # App router for Next.js
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/            # Static assets shared across the app
  │   │   ├── components/        # Shared components
  │   │   ├── constants.ts       # Constant values and enums
  │   │   ├── env.ts             # Environment variables
  │   │   ├── middlewares/       # Global middleware
  │   │   ├── source.ts          # Documentation source
  │   │   └── utils.ts           # Shared utilities for the app
  │   │
  │   └── instrumentation.ts    # Monitoring and analytics instrumentation
  │
  └── content/                # Documentation content in MDX format
```

### Web

This is a marketing website and blog built with Astro, focusing on static content and SEO optimization.

```sh
apps/web
  ├── src/                    # Source code
  │   ├── pages/                 # Pages
  │   │   └── [locale]/          # Localized routes
  │   │
  │   ├── shared/               # Shared utilities and helpers
  │   │   ├── assets/             # Static assets shared across the app (images, icons, etc.)
  │   │   ├── components/         # Reusable components
  │   │   ├── env.ts              # Environment variable configuration
  │   │   ├── constants.ts        # Constant values and enums
  │   │   ├── types.ts            # TypeScript type definitions
  │   │   ├── styles/             # Shared styles
  │   │   ├── utils.ts            # General utility functions
  │   │   └── validation.ts       # Form and data validation schemas
  │   │
  │   └── middleware.ts         # Astro middleware (to enable i18n for static builds)
  │
  └── content/                # Content in MDX format
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
