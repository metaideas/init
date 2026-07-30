# Template Improvement Plans

Plans for evolving the `init` template monorepo. Each plan is self-contained and can be handed to an agent independently, but respect the ordering constraints below.

## Active plans

| #   | Plan                                                                         | Depends on    | Size | Status  |
| --- | ---------------------------------------------------------------------------- | ------------- | ---- | ------- |
| 10  | [init.now marketing site](10-marketing-site.md)                              | 13 (soft)     | M    | Pending |
| 12  | [AGENTS.md + CONTEXT.md + docs refactor](12-agents-context-docs-refactor.md) | 05 (soft), 13 | M    | Pending |
| 15  | [Files SDK integration](15-files-sdk-integration.md)                         | 07            | M    | Pending |

Plan 15 can proceed on the local recipe catalog established by completed plan 07.
Plans 10 and 12 remain independently unblocked; the marketing site no longer blocks
or distributes optional code.

## Completed plans

| #   | Plan                                                                                | Notes                                               |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| 01  | [CLI correctness fixes](01-cli-correctness-fixes.md)                                | CLI is deleted by plan 13; kept as history          |
| 02  | [Package consolidation & dead-code sweep](02-package-consolidation.md)              |                                                     |
| 03  | [App hygiene](03-app-hygiene.md)                                                    |                                                     |
| 04  | [CLI manifest & setup rework](04-cli-manifest-and-setup.md)                         | CLI is deleted by plan 13; kept as history          |
| 05  | [Convex backend example & conventions](05-convex-backend-example.md)                | Durable conventions retained; demo superseded by 14 |
| 07  | [Local template recipes](07-template-recipes.md)                                    | Copy-once recipe catalog and scaffold generators    |
| 09  | [CLI: Effect v4, adamantite, CI](09-cli-effect-v4-and-tooling.md)                   | CLI is deleted by plan 13; kept as history          |
| 13  | [Descope: delete the CLI, return to template scripts](13-descope-cli-to-scripts.md) | CLI removed; template scripts restored              |
| 14  | [Generic backend connection generator](14-connect-backend-generator.md)             | Unified Convex, Hono, and tRPC adapter workflow     |

## Deleted plans

Plans 06 (update command rework), 08 (CLI release automation), and 11 (`bun create init-now` support) were deleted — they existed only because `init-now` was a published npm package, which plan 13 removes. Their durable ideas (rename idempotency, CI scaffold smoke test, agent-update diffing gotchas) were folded into plan 13. Full text remains in git history.

## Context (shared by all plans)

- This repo is a template monorepo. Users scaffold projects with `bun create metaideas/init`, then manage them with plain scripts inside the template (`bun template setup`, `bun template rename`, `bun template add app|package`). See plan 13.
- **CLI removal (decided, plan 13)**: the `init-now` npm package is deprecated and `cli/` deleted. No published tooling, no release-please, no template versioning. Projects stamp the template commit sha in `.template.json` at setup time so agents can diff against upstream for updates.
- Guiding principle: **the template ships a wired, consumed core with zero required external services**. Optional capability lives in selectable packages (chosen during `bun template setup`) or snapshot-matched local Turbo recipes (plan 07). Local dev must work with `docker compose` alone — no accounts, no API keys.
- Packages vs template-recipe criterion (decided):
  - **Package** = ongoing dependency with its own third-party deps and lifecycle (payments, ai, analytics, kv, email client). These stay, even with zero in-template consumers, because setup lets users select them.
  - **Template recipe** = copy-once code the user owns after generation (email templates, one-off utils, extra UI components, auth integration snippets, env presets).
- Recipe definitions ship inside `turbo/generators/` and match the scaffold's recorded
  template commit. There is no hosted registry or independent updater; existing projects
  receive newer recipes through the documented agent-assisted upstream diff workflow.
- `apps/app` is independently full-stack through TanStack Start server routes/functions. `apps/api` (Hono) and `packages/backend` (Convex) are optional backend choices; Plan 14 connects them to clients through local generator adapters. Convex stays in `packages/` because it is consumed like a library (client + generated types) and deploys to Convex cloud.

## Verification (run after any code change)

```sh
bun run format      # adamantite format
bun run check       # lint + typecheck
bun run analyze     # knip dead-code/dep analysis
bun run check:monorepo
bun test            # root workspaces
```

Use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, ...).
