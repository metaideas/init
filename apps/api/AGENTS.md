# apps/api

Apply these rules in `apps/api/**`. The repository standards in the root
[`AGENTS.md`](../../AGENTS.md) also apply.

- Use Hono middleware for authentication.
- Use Hono middleware for logging.
- Use modular handlers.
- Use `app.onError` for global errors.
- Use Hono response helpers.
