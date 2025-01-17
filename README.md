# init

A monorepo for building everywhere.

Contains:

- Web application using Next.js
- Mobile application using Expo
- APIs using Hono & Cloudflare Workers
- Desktop application using Tauri, Vite and Tanstack Router
- Browser extension using WXT
- Documentation site using Starlight (coming soon)
- Blog using Astro (coming soon)

## Project structure

```sh
root
  ├── apps                # Cross-platform applications
  │   ├── api               # Hono API with RPC client, deployed on Cloudflare Workers
  │   ├── web               # Next.js web application
  │   ├── mobile            # Expo mobile application
  │   ├── desktop           # Tauri desktop application
  │   ├── docs              # Nextra documentation site
  │   ├── blog              # Payload CMS blog
  │   └── extensions        # Plasmo browser extensions
  │
  ├── packages            # Shared internal packages for use across apps
  │   ├── ai                # AI utilities
  │   ├── analytics         # Web and product analytics
  │   ├── auth              # Authentication utilities
  │   ├── common            # Shared utilities, helpers, assets, and type definitions
  │   ├── db                # Database client and ORM using Drizzle
  │   ├── email             # Email templating and sending service using Resend
  │   ├── env               # Environment variable management and validation
  │   ├── queue             # Serverless job queue and workflow management using Inngest and Upstash Qstash
  │   ├── kv                # Redis client and vector database integration using Upstash
  │   ├── observability     # Logging, error tracking, and monitoring using Sentry and Axiom
  │   ├── payments          # Payment processing utilities using Stripe
  │   ├── security          # Security utilities and best practices using Arcjet
  │   ├── storage           # Shared storage utilities using UploadThing
  │   ├── ui                # Reusable UI components and design system using Shadcn/UI
  │   └── validation        # Shared data validation schemas using Zod
  │
  ├── tooling             # Shared development and build tools
  │   ├── tailwind          # Tailwind CSS configuration
  │   ├── tsconfig          # TypeScript configuration
  │   └── utils             # Common utility functions for tooling and scripts
  │
  ├── scripts             # Scripts for random tasks
  │
  └── turbo               # Turborepo configuration for monorepo management
      └── generators        # Code generators for packages and tooling
```

## App structure

### Web

```sh
apps/web
  ├── src/                    # Source code
  │   ├── app/                  # App router for Next.js
  │   ├── assets/               # Static assets shared across the app (images, icons, etc.)
  │   ├── components/           # Reusable components
  │   ├── lib/                  # Shared utilities and helpers
  │   │   ├── auth/               # Authentication client and helpers
  │   │   ├── hooks/              # Custom React hooks
  │   │   ├── i18n/               # Internationalization setup
  │   │   ├── middlewares/        # Global middleware to be imported into middleware.ts
  │   │   ├── stores/             # Global state management stores
  │   │   ├── env.ts              # Environment variable configuration
  │   │   ├── constants.ts        # Constant values and enums
  │   │   ├── safe-action.ts      # Type-safe server actions client and middleware
  │   │   ├── types.ts            # TypeScript type definitions
  │   │   ├── utils.ts            # General utility functions
  │   │   └── validation.ts       # Form and data validation schemas
  │   │
  │   ├── server/               # Server-side code
  │   │   ├── data/               # Data access layer (e.g., database queries)
  │   │   ├── loaders.ts          # Shared data fetching functions for server components
  │   │   └── actions.ts          # Shared server actions for handling form submissions and mutations
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
  ├── src/                  # Source code
  │   ├── app/                # App router
  │   ├── assets/             # Static assets shared across the app
  │   │   └── styles/           # Global styles
  │   │
  │   ├── components/         # Shared components used across the entire app
  │   ├── lib/                # Reusable libraries (e.g. hooks, utils)
  │   │   ├── stores/           # Global state stores
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
  │   └── features            # Feature based modules
  │       └──[feature]/         # Specific feature (e.g. auth, dashboard, settings)
  │           ├── assets/         # Feature-specific assets
  │           ├── components/     # Feature-specific components
  │           ├── hooks.ts        # Feature-specific hooks
  │           ├── mutations.ts    # Feature-specific mutations
  │           ├── queries.ts      # Feature-specific queries
  │           ├── stores.ts       # Feature-specific global state stores
  │           ├── types.ts        # Feature-specific types
  │           ├── utils.ts        # Feature-specific utilities
  │           └── validation.ts   # Feature-specific validation schemas
  │
  └── translations          # Translations files
```

### API

```sh
apps/api
  └── src/                  # Source code
      ├── index.ts            # Entry point to the worker
      ├── app.ts              # Main Hono app setup
      ├── client.ts           # RPC client type to be used in other apps
      │
      ├── lib/                # Reusable libraries (e.g. middleware, utils)
      │   ├── constants.ts      # Constant values and enums
      │   ├── env.ts            # Environment variables
      │   ├── middlewares.ts    # Shared middlewares
      │   ├── types.ts          # Shared types
      │   └── utils.ts          # General utility functions
      │
      └── features/           # Feature based modules
          └──[feature]/         # Specific feature (e.g. auth, dashboard, settings)
              ├── router.ts       # Feature-specific router
              ├── procedures.ts   # Feature-specific procedures
              ├── types.ts        # Feature-specific types
              ├── utils.ts        # Feature-specific utilities
              └── validation.ts   # Feature-specific validation schemas
```

### Desktop

```sh
apps/desktop
  ├── src/                  # Source code
  │   ├── main.tsx            # Entry point to the desktop app
  │   ├── routes/             # Routing
  │   ├── assets/             # Static assets shared across the app
  │   │   └── styles/           # Global styles
  │   │
  │   ├── components/         # Shared components used across the entire app
  │   │
  │   ├── lib/                # Reusable libraries (e.g. hooks, utils)
  │   │   ├── stores/           # Global state stores
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
  │   └── features            # Feature based modules
  │       └──[feature]/         # Specific feature (e.g. auth, dashboard, settings)
  │           ├── assets/         # Feature-specific assets
  │           ├── components/     # Feature-specific components
  │           ├── hooks.ts        # Feature-specific hooks
  │           ├── mutations.ts    # Feature-specific mutations
  │           ├── queries.ts      # Feature-specific queries
  │           ├── stores.ts       # Feature-specific global state stores
  │           ├── types.ts        # Feature-specific types
  │           ├── utils.ts        # Feature-specific utilities
  │           └── validation.ts   # Feature-specific validation schemas
  │
  └── translations          # Translations files
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
  ├── src/                  # Source code
  │   ├── assets/             # Assets processed by WXT
  │   │   └── styles/           # Global styles
  │   │
  │   ├── components/         # Shared components used across the entire extension
  │   │
  │   ├── lib/                # Reusable libraries (e.g. hooks, utils)
  │   │   ├── services/         # Shared services
  │   │   ├── stores/           # Global state stores
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
  │   ├── entrypoints/        # Entrypoints
  │   │   ├── popup/            # Popup entrypoint
  │   │   ├── background/       # Background script entrypoint
  │   │   └── ...               # Other entrypoints
  │   │
  │   ├── features            # Feature based modules
  │   │   └──[feature]/         # Specific feature (e.g. auth, dashboard, settings)
  │   │       ├── assets/         # Feature-specific assets
  │   │       ├── components/     # Feature-specific components
  │   │       ├── hooks.ts        # Feature-specific hooks
  │   │       ├── mutations.ts    # Feature-specific mutations
  │   │       ├── queries.ts      # Feature-specific queries
  │   │       ├── services.ts     # Feature-specific services
  │   │       ├── stores.ts       # Feature-specific global state stores
  │   │       ├── types.ts        # Feature-specific types
  │   │       ├── utils.ts        # Feature-specific utilities
  │   │       └── validation.ts   # Feature-specific validation schemas
  │   │
  │   └── static/             # Static assets not processed by WXT. Includes the extension icon.
  │
  └── wxt.config.ts         # WXT configuration
```

## Development

To start the development server, run `pnpm dev` on the root directory.

### Ports

Apps run in the 3000-3999 range. Packages run in the 8000-8999 range.

- Web: 3000
- API: 3001
- Mobile: 3002
- Desktop: 3003
- Blog: 3004
- Docs: 3005
- Extension: 3006

- Database: 8080
- Email: 8081
- Queue: 8288