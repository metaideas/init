# init

## Project structure

```sh
root
  ├── apps                # Applications
  │   ├── web               # Web application, built with Next.js
  │   ├── mobile            # Mobile application, built with Expo
  │   ├── desktop           # Desktop application, built with Tauri
  │   ├── api               # API (+ RPC client), built with Hono and deployed to Cloudflare Workers
  │   ├── docs              # Documentation, built with Nextra
  │   └── extensions        # Extensions, built with Plasmo
  │
  ├── packages            # Internal packages to be used in apps
  │   ├── analytics         # Web and product analytics
  │   ├── auth              # Authentication helpers
  │   ├── common            # Shared utilities, helper, assets and types
  │   ├── db                # Database client using Drizzle ORM
  │   ├── email             # Email templates and service
  │   ├── env               # Environment variables
  │   ├── queue             # Serverless job queue and workflows
  │   ├── kv                # Redis client and vector database
  │   ├── observability     # Logging, error tracking and monitoring
  │   ├── security          # Security helpers
  │   ├── ui                # UI components and blocks
  │   └── validation        # Shared validation schemas
  │
  ├── tooling             # Shared tooling for packages and apps
  │   ├── tailwind          # Tailwind config
  │   ├── tsconfig          # Typescript config
  │   └── utils             # Utility functions
  │
  └── turbo               # Turbo config
      └── generators        # Package and tooling generators
```

## App structure

### Web

```sh
apps/web
  ├── src/                    # Source code
  │   ├── app                   # App router
  │   ├── assets                # Static assets shared across the app
  │   ├── components            # Shared components used across the entire app
  │   ├── lib                   # Reusable libraries (e.g. hooks, utils)
  │   │   ├── auth                # Authentication client and helpers
  │   │   ├── safe-action.ts      # Safe action client and middleware
  │   │   ├── hooks.ts            # Shared hooks
  │   │   ├── stores.ts           # Global state stores
  │   │   ├── types.ts            # Shared types
  │   │   ├── validation.ts       # Shared validation schemas
  │   │   └── utils.ts            # Shared utilities for the app
  │   │
  │   ├── server                  # Server-side code
  │   │   ├── data.ts               # Data-layer for the application
  │   │   ├── loaders.ts            # Shared data loaders
  │   │   └── actions.ts            # Shared server actions
  │   │
  │   ├── styles                  # Global styles
  │   ├── config                  # Application configuration
  │   │   ├── i18n.ts             # Internationalization
  │   │   └── consts.ts           # Constant values
  │   │
  │   ├── middleware              # Middleware
  │   ├── instrumentation         # Instrumentation
  │   └── features                # Feature based modules
  │       └──[feature name]        # Specific feature
  │           ├── actions.ts        # Specific feature actions
  │           ├── assets            # Specific feature assets
  │           ├── components        # Specific feature components
  │           ├── hooks.ts          # Specific feature hooks
  │           ├── loaders.ts        # Specific feature loaders
  │           ├── stores.ts         # Specific feature global state stores
  │           ├── types.ts          # Specific feature types
  │           ├── validation.ts     # Specific feature validation schemas
  │           └── utils.ts          # Specific feature utilities
  │
  ├── translations              # Translations files
  └── globals.d.ts              # Global types
```

### Mobile

```sh
apps/mobile
  ├── src/                  # Source code
  │   ├── app                 # App router
  │   ├── assets              # Static assets shared across the app
  │   ├── components          # Shared components used across the entire app
  │   ├── lib                 # Reusable libraries (e.g. hooks, utils)
  │   │   ├── hooks.ts          # Shared hooks
  │   │   ├── stores.ts         # Global state stores
  │   │   ├── types.ts          # Shared types
  │   │   └── utils.ts          # Shared utilities for the app
  │   │
  │   ├── api                 # Global API client
  │   ├── styles              # Global styles
  │   ├── config              # Application configuration
  │   │   ├── i18n.ts           # Internationalization
  │   │   └── consts.ts         # Constant values
  │   │
  │   ├── middleware            # Middleware
  │   └── features              # Feature based modules
  │       └──[feature name]      # Specific feature
  │           ├── api.ts            # Specific feature API client
  │           ├── assets            # Specific feature assets
  │           ├── components        # Specific feature components
  │           ├── hooks.ts          # Specific feature hooks
  │           ├── stores.ts         # Specific feature global state stores
  │           ├── types.ts          # Specific feature types
  │           └── utils.ts          # Specific feature utilities
  │
  └── translations          # Translations files
```

### API

```sh
apps/api
  └── src/                 # Source code
      ├── index.ts           # Entry point to the worker
      ├── app.ts             # API app
      ├── client.ts          # RPC client to be used in other apps
      ├── routes             # API routes
      ├── middleware         # API middleware
      └── features           # Feature based modules
```

### Desktop

```sh
apps/desktop
```

### Docs

```sh
apps/docs
```

### Extensions

```sh
apps/extensions
```
