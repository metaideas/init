# Getting Started

## Prerequisites

- We use [bun](https://bun.sh/) as our package manager.
- You'll need Node.js installed (see tooling expectations below).
- You'll need Docker installed for running the database and Redis. I recommend using [OrbStack](https://orbstack.dev/) for managing your containers.

## Tooling Expectations

- Bun: `1.3.x` (matches `package.json` `packageManager`)
- Node.js: `>=24` (matches `package.json` `engines`)

## Setup

1. Install the dependencies using `bun`:

```bash
bun install
```

2. Configure the template:

```bash
bun template setup
```

This will:

- Let you choose the workspaces you want to include
- Rename the project and update all the imports
- Initialize a Git repository if needed
- Clean up internal template files
- Install dependencies

### Choosing Workspaces

`template setup` prompts for apps first, then packages. Later, add workspaces with `bun template add app <name>` or `bun template add package <name>`.

3. Generate source files and types:

```bash
bun run codegen
```

4. Start your local services using `docker`:

```bash
bun run docker:up
```

5. Start the development server:

```bash
bun run dev # or bun run dev --filter <workspace> to start a specific workspace
```

### First Run Checklist

- Run `bun template setup`
- Generate source files and types with `bun run codegen`
- Start services with `bun run docker:up`
- Start a workspace with `bun run dev --filter <workspace>`

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

Packages run in the 4000-4999 range.

- Email: `4000`
- Convex: `4001`
- Convex site: `4002`
- Desktop HMR: `4003`

#### Infra

Infra runs in the 8000-8999 range.

- Redis: `8000`
- Database: `8001`
- Minio: `8002` (S3), `8003` (console)
- Workflows (Inngest): `8004`

### Troubleshooting

- Bun version mismatch: run `bun --version`, update to `1.3.x`.
- Node version mismatch: install Node.js `>=24` with your version manager.
- Docker services not running: check `docker ps`, then run `bun run docker:up`.
- Missing env variables: compare `.env.local` with each `.env.template`.
