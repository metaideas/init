# Template Improvement Plans

Plans for evolving the `init` template monorepo. Each plan is self-contained and can be handed to an agent independently, but respect the ordering constraints below.

## Active plans

| #   | Plan                                                                                | Depends on    | Size | Status  |
| --- | ----------------------------------------------------------------------------------- | ------------- | ---- | ------- |
| 05  | [Convex backend example & conventions](05-convex-backend-example.md)                | —             | S    | Pending |
| 07  | [Registry (init.now)](07-registry.md)                                               | 10, 13        | L    | Pending |
| 10  | [init.now marketing site](10-marketing-site.md)                                     | 13 (soft)     | M    | Pending |
| 12  | [AGENTS.md + CONTEXT.md + docs refactor](12-agents-context-docs-refactor.md)        | 05 (soft), 13 | M    | Pending |
| 13  | [Descope: delete the CLI, return to template scripts](13-descope-cli-to-scripts.md) | —             | M    | Pending |

Ordering: **13 runs first** — it changes how projects are created and managed, which 10 and 12 document and 07 builds on. 10 markets the `bun create` flow. 07 is last — it hosts copy-once "registry backlog" items on the site built in 10, consumed via browse/copy-paste, agent-fetchable URLs, and/or the shadcn registry format (no CLI).

## Completed plans

| #   | Plan                                                                   | Notes                                      |
| --- | ---------------------------------------------------------------------- | ------------------------------------------ |
| 01  | [CLI correctness fixes](01-cli-correctness-fixes.md)                   | CLI is deleted by plan 13; kept as history |
| 02  | [Package consolidation & dead-code sweep](02-package-consolidation.md) |                                            |
| 03  | [App hygiene](03-app-hygiene.md)                                       |                                            |
| 04  | [CLI manifest & setup rework](04-cli-manifest-and-setup.md)            | CLI is deleted by plan 13; kept as history |
| 09  | [CLI: Effect v4, adamantite, CI](09-cli-effect-v4-and-tooling.md)      | CLI is deleted by plan 13; kept as history |

## Deleted plans

Plans 06 (update command rework), 08 (CLI release automation), and 11 (`bun create init-now` support) were deleted — they existed only because `init-now` was a published npm package, which plan 13 removes. Their durable ideas (rename idempotency, CI scaffold smoke test, agent-update diffing gotchas) were folded into plan 13. Full text remains in git history.

## Context (shared by all plans)

- This repo is a template monorepo. Users scaffold projects with `bun create metaideas/init`, then manage them with plain scripts inside the template (`bun template setup`, `bun template rename`, `bun template add app|package`). See plan 13.
- **CLI removal (decided, plan 13)**: the `init-now` npm package is deprecated and `cli/` deleted. No published tooling, no release-please, no template versioning. Projects stamp the template commit sha in `.template.json` at setup time so agents can diff against upstream for updates.
- Guiding principle: **the template ships a wired, consumed core with zero required external services**. Optional capability lives in selectable packages (chosen during `bun template setup`) or, eventually, a hosted registry (plan 07). Local dev must work with `docker compose` alone — no accounts, no API keys.
- Packages vs registry criterion (decided):
  - **Package** = ongoing dependency with its own third-party deps and lifecycle (payments, ai, analytics, kv, email client). These stay, even with zero in-template consumers, because setup lets users select them.
  - **Registry item** = copy-once code the user owns after install (email templates, one-off utils, extra UI components, auth integration snippets, env presets).
- `apps/app` is independently full-stack through TanStack Start server routes/functions. `apps/api` (Hono) and `packages/backend` (Convex) are optional backend choices connected through registry-installed adapters; Convex stays in `packages/` because it is consumed like a library (client + generated types) and deploys to Convex cloud.

## Verification (run after any code change)

```sh
bun run format      # adamantite format
bun run check       # lint + typecheck
bun run analyze     # knip dead-code/dep analysis
bun run check:monorepo
bun test            # root workspaces
```

Use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, ...).
