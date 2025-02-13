# Project structure

```sh
root
  ├── apps                # Cross-platform applications
  │   ├── api               # Hono API with RPC client, deployed on Cloudflare Workers
  │   ├── web               # Next.js web application with content collections for marketing pages
  │   ├── mobile            # Expo mobile application
  │   ├── desktop           # Tauri desktop application
  │   └── extensions        # WXT browser extensions
  │
  ├── infra               # Infrastructure as code for cloud providers
  │   └── local             # Docker Compose configuration for local development
  │
  ├── packages            # Shared internal packages for use across apps
  │   ├── ai                # AI utilities
  │   ├── analytics         # Web and product analytics
  │   ├── auth              # Authentication utilities
  │   ├── db                # Database client and ORM using Drizzle
  │   ├── email             # Email templating and sending service using Resend
  │   ├── env               # Environment variable management and validation
  │   ├── kv                # Redis client and vector database integration using Upstash
  │   ├── native-ui         # Reusable UI components for React Native apps
  │   ├── observability     # Logging, error tracking, and monitoring using Sentry and Axiom
  │   ├── payments          # Payment processing utilities using Stripe
  │   ├── queue             # Serverless job queue and workflow management using Upstash
  │   ├── security          # Security utilities and best practices using Arcjet
  │   ├── storage           # Shared storage utilities using UploadThing
  │   ├── ui                # Reusable UI components and design system using Shadcn/UI
  │   └── utils             # Shared helpers and constants for packages and apps
  │
  ├── tooling             # Shared development and build tools
  │   ├── tsconfig          # TypeScript configuration
  │   └── helpers           # Common utility functions for tooling and scripts
  │
  ├── scripts             # Scripts for random tasks
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

### Web

The web app is a Next.js application with content collections for marketing pages.

```sh
apps/web
  ├── src/                    # Source code
  │   ├── app/                  # App router for Next.js
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

```sh
apps/desktop
  ├── src/                    # Source code
  │   ├── main.tsx              # Entry point to the desktop app
  │   ├── routes/               # Routing
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

### Extensions

```sh
apps/extensions
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
  │   ├── features/             # Feature based modules
  │   │   └──[feature]/           # Specific feature (e.g. auth, dashboard, settings)
  │   │       ├── assets/          # Feature-specific assets
  │   │       ├── components/      # Feature-specific components
  │   │       ├── hooks.ts         # Feature-specific hooks
  │   │       ├── mutations.ts     # Feature-specific mutations
  │   │       ├── queries.ts       # Feature-specific queries
  │   │       ├── services.ts      # Feature-specific services
  │   │       ├── stores.ts        # Feature-specific global state stores
  │   │       ├── types.ts         # Feature-specific types
  │   │       ├── utils.ts         # Feature-specific utilities
  │   │       └── validation.ts    # Feature-specific validation schemas
  │   │
  │   ├── routes/               # Routing shared by all entrypoints
  │   │   ├── __root.tsx          # Root route
  │   │   └── ...                 # Other routes
  │   │
  │   ├── static/               # Static assets not processed by WXT. Includes the extension icon.
  │   │
  │   ├── router.ts             # Router instance
  │   └── routeTree.gen.ts      # Auto-generated route tree
  │
  └── wxt.config.ts           # WXT configuration
```

### Docs

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
