# Template Improvement Plans

Plans for evolving the `init` template monorepo and its `init-now` CLI. Each plan is self-contained and can be handed to an agent independently, but respect the ordering constraints below.

## Plans

| #   | Plan                                                                         | Depends on           | Size | Status  |
| --- | ---------------------------------------------------------------------------- | -------------------- | ---- | ------- |
| 01  | [CLI correctness fixes](01-cli-correctness-fixes.md)                         | —                    | S    | Done    |
| 02  | [Package consolidation & dead-code sweep](02-package-consolidation.md)       | —                    | M    | Pending |
| 03  | [App hygiene](03-app-hygiene.md)                                             | —                    | M    | Pending |
| 04  | [CLI manifest & setup rework](04-cli-manifest-and-setup.md)                  | 01, 02, 09           | L    | Pending |
| 05  | [Convex backend example & conventions](05-convex-backend-example.md)         | 02                   | S    | Pending |
| 06  | [Update command rework](06-update-command-rework.md)                         | 01, 04, 09           | L    | Pending |
| 07  | [Registry (init.now)](07-registry.md)                                        | 02, 04, 10           | L    | Pending |
| 08  | [CLI release automation](08-cli-release-automation.md)                       | 01, 09               | S    | Pending |
| 09  | [CLI: Effect v4, adamantite, CI](09-cli-effect-v4-and-tooling.md)            | 01                   | L    | Pending |
| 10  | [init.now marketing site](10-marketing-site.md)                              | —                    | M    | Pending |
| 11  | [`bun create init-now` support](11-bun-create-support.md)                    | 08, 09               | S    | Pending |
| 12  | [AGENTS.md + CONTEXT.md + docs refactor](12-agents-context-docs-refactor.md) | 02 (soft), 05 (soft) | M    | Pending |

01, 02, 03, and 10 can run in parallel. 09 follows 01 and precedes the CLI feature work (04, 06, 08) so new code is written against Effect v4 and passes the CLI's own adamantite checks/CI. 06 builds on 04's manifest. 07 is last — it consumes the "registry backlog" items that 02/03 remove from the template and is hosted on the site built in 10.

## Context (shared by all plans)

- This repo is a template monorepo. Users scaffold projects from it with the `init-now` CLI (source in `cli/`, published to npm separately — `cli/` is NOT part of the root Bun workspaces).
- Guiding principle: **the template ships a wired, consumed core with zero required external services**. Optional capability lives in selectable packages (chosen during `init-now setup`) or, eventually, a hosted registry (plan 07). Local dev must work with `docker compose` alone — no accounts, no API keys.
- Packages vs registry criterion (decided):
  - **Package** = ongoing dependency with its own third-party deps and lifecycle (payments, ai, analytics, kv, email client). These stay, even with zero in-template consumers, because the CLI lets users select them.
  - **Registry item** = copy-once code the user owns after install (email templates, one-off utils, extra UI components, auth integration snippets, env presets).
- `packages/backend` (Convex) stays in `packages/` — it is consumed like a library (client + generated types) and deploys to Convex cloud, not our infra. It is an intentional _alternative_ to `apps/api`, not dead code.
- **Lockstep versioning (decided)**: the template (`init`), the CLI (`init-now`), and later `create-init-now` share one version number via release-please linked versions (plan 08). CLI-only releases produce no-op template updates, handled gracefully by `update` (plan 06).

## Verification (run after any code change)

```sh
bun run format      # adamantite format
bun run check       # lint + typecheck
bun run analyze     # knip dead-code/dep analysis
bun run check:monorepo
bun test            # root workspaces
cd cli && bun test  # CLI has its own lockfile/tests
```

Use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, ...).
