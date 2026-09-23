# Base image with Bun
FROM oven/bun:1.4.2 AS base

# Install turbo CLI globally using Bun
FROM base AS turbo-cli
RUN bun add -g turbo

# Builder stage: prune the monorepo for the api app
FROM turbo-cli AS builder
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# Installer stage: install only pruned dependencies and build
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
# Don't copy the lockfile, allow bun to generate a fresh one
RUN bun install

COPY --from=builder /app/out/full/ .

# Generate the ignored environment bindings and message catalogs for the pruned workspaces
RUN bun run codegen

# Runner stage: production image with non-root user
FROM installer AS runner

USER root
RUN groupadd --system --gid 1001 appgroup && useradd --system --uid 1001 --gid appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["bun", "run", "start"]