# Import and boundary standards

Apply these rules when you add or change imports.

- Use `#` subpath imports within a package. They resolve from its `src` directory.
- Use `@init/*` to import another workspace package.
- Do not import between apps.
- Only `apps/api/src/client.ts` can import from another app.
- Within an app, imports flow `shared` → `features` → routes/entrypoints:
  - `shared` imports only dependencies and other `shared` modules.
  - A feature can import `shared`, but not another feature.
  - Routes and entrypoints can import `shared` and features, but not other routes.
  - `apps/api` routes can import other routes for Hono composition.
- Avoid circular imports.
