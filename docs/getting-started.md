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

### Ports

#### Apps

Apps run in the 3000-3999 range.

- API: `3000`
- App: `3001`
- Mobile: `3002`
- Desktop: `3003`
- Extension: `3004`
- Docs: `3005`
- Web: `3006`

#### Packages

Packages run in the 8000-8999 range.

- Redis: `8079`
- Database: `8080`
- Email: `8081`
- Queue: `8288`