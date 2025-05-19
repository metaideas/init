FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm and turbo globally using npm
RUN npm install -g pnpm && pnpm install -g turbo

# Builder stage: prune the monorepo for the api app
FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune api --docker

# Installer stage: install only pruned dependencies and build
FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN pnpm install
COPY --from=builder /app/out/full/ .
RUN pnpm run build --filter api
RUN pnpm prune --prod

# Runner stage: production image with non-root user
FROM installer AS runner
ENV NODE_ENV=production
ENV PORT=3000
USER root
RUN addgroup --system --gid 1001 appgroup && \
  adduser --system --uid 1001 --ingroup appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

WORKDIR /app/apps/api
EXPOSE 3000

CMD ["pnpm", "run", "start"]