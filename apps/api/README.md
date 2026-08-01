<div align="center">
  <h1 align="center"><code>api</code></h1>
</div>

API server built with [Hono](https://hono.dev/).

The API server includes the authenticated Files SDK gateway at `/files`.
Provider composition and upload policy live in `src/shared/files.ts`; local development
uses the MinIO service and `assets` bucket from `infra/local/docker-compose.yml`.
