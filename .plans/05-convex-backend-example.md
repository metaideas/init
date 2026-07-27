# Plan 05 — Convex backend example & conventions

`packages/backend` (Convex + `@convex-dev/better-auth`) is an intentional **alternative** to `apps/api`: choose a self-managed Hono API, or a Convex backend (e.g., a mobile app that doesn't want to run a server). Decision: it **stays in `packages/`** — it is consumed like a library (React client + generated types) and deploys to Convex cloud, not our infra; this also matches Convex's own Turborepo conventions.

The problem: today it has **zero consumers**, so the alternative is asserted but never demonstrated, and drift between the two auth setups goes unnoticed.

## 1. Minimal consumption example in `apps/mobile`

Mobile is the natural pairing (the stated use case). Add a small, clearly-optional example:

- A screen (e.g. `src/app/convex-demo.tsx` or a `features/convex-demo` module per repo structure rules) that uses `@init/backend`'s React client (`packages/backend/src/client/index.ts`) — a `ConvexProvider` + one live query against an existing model (`packages/backend/src/functions/models/documents.ts`).
- Env wiring: `EXPO_PUBLIC_CONVEX_URL` via the existing `convex` preset in `packages/env/src/presets.ts`, validated in `apps/mobile/src/shared/env.ts`.
- Add `@init/backend` to `apps/mobile/package.json`.
- Keep it deletable: the example must be self-contained (one feature folder + one route + one provider wrapper) so choosing the Hono backend in `init-now setup` (plan 04) can delete `packages/backend` and this example folder cleanly. Document the coupling in the manifest if plan 04 has landed (e.g. example ships only when backend=convex); otherwise leave a note in the feature's README.

Constraint: **no external service required to pass CI** — `convex dev` needs an account, so the example must typecheck and build without a running deployment (guard the provider on env presence, render a "Convex not configured" state otherwise). Same pattern as Sentry: wired seam, opt-in service.

## 2. Reduce duplication between the two backends

Don't force-share code between alternatives (they must delete cleanly), but eliminate accidental drift:

- Auth config: `packages/backend/src/functions/shared/auth.ts` vs `apps/api/src/shared/auth.ts` duplicate better-auth settings (session/user config). Extract genuinely shared, service-free constants (session TTLs, cookie names, plugin lists if identical) into `@init/auth` so both consume one source. Leave provider-specific wiring in place.
- `LoggerCategory.CONVEX` in `@init/observability`: fine to keep (observability is cross-cutting), but verify the category is actually used by `packages/backend` logging; delete if not.

## 3. Documentation & conventions

- `AGENTS.md`: the Project Structure section says deployables live in `apps/`. Add a carve-out: _hosted-platform backends consumed as libraries (e.g., Convex) live in `packages/`_. This prevents relitigating the placement.
- `docs/project-structure.md`: same clarification; also fix the stale claim that `scripts/` contains the template-sync script (sync lives in the `init-now` CLI).
- Add a short `packages/backend/README.md` section (or extend the existing one): when to choose Convex vs `apps/api`, and that `apps/app` currently requires `apps/api`.

## Acceptance criteria

- `apps/mobile` imports `@init/backend` and renders the demo screen; app builds/typechecks with no Convex deployment configured.
- Deleting `packages/backend` + the mobile example folder leaves a green `bun run check` (verify manually; plan 04 automates it).
- No duplicated better-auth constants between the two backend stacks.
- AGENTS.md and docs updated.
