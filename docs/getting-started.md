# Getting Started

## Prerequisites

- We use [bun](https://bun.sh/) as our package manager.
- You'll need Nodejs v22 or higher installed.
- You'll need Docker installed for running the database and Redis. I recommend using [OrbStack](https://orbstack.dev/) for managing your containers.

## Setup

1. Install the dependencies using `bun`:

```bash
bun install
```

2. Run the `init` script:

```bash
bun template init
```

This will:

- Let you choose the workspaces you want to include
- Rename the project and update all the imports
- Setup environment files from templates
- Setup a remote template branch for syncing updates
- Clean up internal template files
- Create a fresh README for your project

3. Start your local services using `docker`:

```bash
bun docker:up
```

4. Start the development server:

```bash
bun dev # or bun dev --filter <workspace> to start a specific workspace
```

### Environment Setup

Each workspace includes a `.env.template` file that defines the required and optional environment variables for that workspace. The `bun template init` script automatically copies these templates to `.env.local` files (which are git-ignored).

#### Environment Variable Prefixes

Different platforms require different prefixes for client-side environment variables:

- **Web/App/Desktop (Vite)**: `PUBLIC_` - Variables prefixed with `PUBLIC_` are exposed to the browser
- **Extension (Vite/WXT)**: `VITE_` - Variables prefixed with `VITE_` are exposed to the extension
- **Mobile (Expo)**: `EXPO_PUBLIC_` - Variables prefixed with `EXPO_PUBLIC_` are exposed to the mobile app
- **Desktop (Tauri)**: `TAURI_ENV_` - Automatically set by Tauri, plus `PUBLIC_` for app-level client config

Server-side variables (used in API routes, server functions, etc.) do not require a prefix.

#### Manual Setup

If you need to manually set up environment variables:

1. Copy the `.env.template` file to `.env.local` in each workspace you're using:
   ```bash
   cp apps/api/.env.template apps/api/.env.local
   cp apps/app/.env.template apps/app/.env.local
   # ... etc
   ```

2. Fill in the required values in each `.env.local` file. The template files include comments explaining what each variable is for.

3. Never commit `.env.local` files - they're automatically git-ignored.

#### Required Variables

Most workspaces require at minimum:
- **API**: `BASE_URL`, `PORT`, `AUTH_SECRET`, `DATABASE_URL`, `REDIS_URL`
- **App**: `PUBLIC_BASE_URL`, `AUTH_SECRET`, `DATABASE_URL`, OAuth provider credentials
- **Web**: `PUBLIC_API_URL`, `TEST_VAR`
- **Mobile**: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SENTRY_DSN`
- **Desktop**: `PUBLIC_API_URL`
- **Extension**: `VITE_API_URL`

See each workspace's `.env.template` file for the complete list of required and optional variables.

### Ports

#### Apps

Apps run in the 3000-3999 range.

- API: `3000`
- App: `3001`
- Mobile: `3002`
- Desktop: `3003`
- Docs: `3004`
- Extension: `3005`
- Web: `3006`

#### Packages

Packages run in the 8000-8999 range.

- Redis: `8079`
- Database: `8080`
- Email: `8081`
- Queue: `8288`
