# init

## Project structure

```sh
root
  ├── apps                # Cross-platform applications
  │   ├── web               # Next.js web application
  │   ├── mobile            # Expo mobile application
  │   ├── desktop           # Tauri desktop application
  │   ├── api               # Hono API with RPC client, deployed on Cloudflare Workers
  │   ├── docs              # Nextra documentation site
  │   ├── blog              # Payload CMS blog
  │   └── extensions        # Plasmo browser extensions
  │
  ├── packages            # Shared internal packages for use across apps
  │   ├── analytics         # Web and product analytics
  │   ├── auth              # Authentication utilities
  │   ├── common            # Shared utilities, helpers, assets, and type definitions
  │   ├── db                # Database client and ORM using Drizzle
  │   ├── email             # Email templating and sending service using Resend
  │   ├── env               # Environment variable management and validation
  │   ├── queue             # Serverless job queue and workflow management using Inngest and Upstash Qstash
  │   ├── kv                # Redis client and vector database integration using Upstash
  │   ├── observability     # Logging, error tracking, and monitoring using Sentry and Axiom
  │   ├── security          # Security utilities and best practices using Arcjet
  │   ├── ui                # Reusable UI components and design system using Shadcn/UI
  │   └── validation        # Shared data validation schemas using Zod
  │
  ├── tooling             # Shared development and build tools
  │   ├── tailwind          # Tailwind CSS configuration
  │   ├── tsconfig          # TypeScript configuration
  │   └── utils             # Common utility functions for tooling and scripts
  │
  ├── scripts             # Common scripts for tooling
  │
  └── turbo               # Turborepo configuration for monorepo management
      └── generators        # Code generators for packages and tooling
```

## App structure

### Web

```sh
apps/web
  ├── src/                    # Source code
  │   ├── app                   # App router for Next.js
  │   ├── assets                # Static assets shared across the app (images, icons, etc.)
  │   ├── components            # Reusable components
  │   ├── lib                   # Shared utilities and helpers
  │   │   ├── auth                # Authentication client and helpers
  │   │   ├── safe-action.ts      # Type-safe server actions client and middleware
  │   │   ├── hooks.ts            # Custom React hooks
  │   │   ├── stores.ts           # Global state management stores
  │   │   ├── atoms.ts            # Global atoms for state management
  │   │   ├── types.ts            # TypeScript type definitions
  │   │   ├── validation.ts       # Form and data validation schemas
  │   │   └── utils.ts            # General utility functions
  │   │
  │   ├── server                  # Server-side code
  │   │   ├── data                  # Data access layer (e.g., database queries)
  │   │   ├── loaders.ts            # Data fetching functions for server components
  │   │   └── actions.ts            # Server actions for handling form submissions and mutations
  │   │
  │   ├── styles                  # Global styles and Tailwind CSS configuration
  │   ├── config                  # Application configuration
  │   │   ├── i18n.ts             # Internationalization setup
  │   │   └── consts.ts           # Constant values and enums
  │   │
  │   ├── middleware              # Next.js middleware for request/response modification
  │   ├── instrumentation         # Monitoring and analytics instrumentation
  │   └── features                # Feature-based modules
  │       └──[feature name]        # Specific feature (e.g., auth, dashboard, settings)
  │           ├── actions.ts        # Feature-specific server actions
  │           ├── assets            # Feature-specific assets
  │           ├── components        # Feature-specific components
  │           ├── hooks.ts          # Feature-specific custom hooks
  │           ├── loaders.ts        # Feature-specific data loaders
  │           ├── stores.ts         # Feature-specific state stores
  │           ├── types.ts          # Feature-specific type definitions
  │           ├── validation.ts     # Feature-specific validation schemas
  │           └── utils.ts          # Feature-specific utility functions
  │
  ├── translations              # Internationalization translation files
  └── globals.d.ts              # Global TypeScript declarations

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

### Blog

```sh
apps/blog
```

### Extensions

```sh
apps/extensions
```