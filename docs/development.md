# Development

## Tooling Requirements

See `docs/getting-started.md` for the authoritative versions. In short:

- Bun `1.3.x`
- Node.js `>=24`

## Commands

These match the root `package.json` scripts.

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `bun run dev`          | Start all workspaces with named HTTPS URLs |
| `bun run dev:apps`     | Start application workspaces with Portless |
| `bun run dev:packages` | Start package workspaces with Portless     |
| `bun run build`        | Build all workspaces                       |
| `bun run clean`        | Clean build artifacts                      |
| `bun run check`        | Run Adamantite checks                      |
| `bun run fix`          | Auto-fix issues with Adamantite            |
| `bun run format`       | Format code with Adamantite                |
| `bun run test`         | Run the test suite                         |
| `bun run docker:up`    | Start local services                       |
| `bun run docker:down`  | Stop local services                        |
| `bun run boundaries`   | Generate dependency boundaries report      |

If you want to run a command for a specific workspace, you can use the following syntax:

```bash
bun run <command> --filter <workspace>
```

## Portless

Every HTTP-serving workspace uses `portless` as its `dev` script and keeps its
underlying framework command in `dev:app`, following Portless's
[recommended Turborepo configuration](https://portless.sh/configuration). This means
both root commands such as `bun run dev` and workspace-local commands such as
`cd apps/api && bun run dev` use named HTTPS URLs. The normalized npm scope owns the
hostname suffix. For a scope named `example`, the App uses
`https://example.localhost`, the API uses `https://api.example.localhost`, and other
HTTP development servers follow the same `<workspace>.example.localhost` convention.

Each HTTP-serving workspace's package-local `portless` object is the source of truth
for its project-qualified name and `dev:app` script. Portless assigns an available
upstream port at runtime, so multiple projects can run concurrently without sharing
application ports. Separate projects still need distinct npm scopes—and therefore
distinct Portless names—while Git worktrees receive automatic route prefixes.

Drizzle Studio, React Email, and the Inngest dev server use the same package-local
pattern. Inngest runs from `packages/workflows`; Docker Compose is reserved for data
infrastructure.

The first run may request administrator access to trust Portless's local certificate
authority and bind port 443. Use `portless doctor` to inspect proxy, certificate, DNS,
and route health.

Portless routes Mobile, Desktop, and Extension development servers, but it does not
replace Expo, Tauri, or browser-extension launch behavior. `.localhost` resolves only
on the development machine; physical devices require Portless LAN mode and `.local`.

## Managing Dependencies

- `bun run bump:deps` - Update dependencies interactively
- `bun run analyze` - Detect unused dependencies and files
- `bun run check:monorepo` - Validate monorepo rules
- `bun run fix:monorepo` - Auto-fix monorepo issues

## Template Management

- `bun template setup` - Configure the project and stamp its template version
- `bun template rename` - Rename the project and update package scope references
- `bun template add app <name>` - Add an app workspace from the template
- `bun template add package <name>` - Add a package workspace from the template
- `bun run scripts` - Run the extensible entry point for project-owned scripts

Template updates are agent-driven; see
[Updating your project](./template-commands.md#updating-your-project).
