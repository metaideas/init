FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install git for fetching git dependencies and ca-certificates for SSL verification
RUN apt-get update && apt-get install -y git ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Install pnpm globally using npm
RUN npm install -g pnpm

# Builder stage
FROM base AS builder
WORKDIR /app
# Install turbo globally
RUN pnpm install -g turbo
# Copy all files (ensure your root .dockerignore is comprehensive)
COPY . .
# Prune the workspaces to only the api and its dependencies
RUN turbo prune api --docker

# Installer stage
FROM base AS installer
WORKDIR /app

# Install turbo globally for the build step
RUN pnpm install -g turbo

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
# pnpm install will use the pruned pnpm-lock.yaml from out/json/
RUN pnpm install --prod

# Copy the full pruned source code
COPY --from=builder /app/out/full/ .
# Add a build step for the 'api' application
RUN pnpm run build --filter api

# Runner stage
FROM installer AS runner


# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create a non-root user and group for security
USER root
RUN addgroup --system --gid 1001 appgroup && \
  adduser --system --uid 1001 --ingroup appgroup appuser

# Change ownership of the app files to the new user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Set the API directory as working directory
WORKDIR /app/apps/api

# Expose the port the API runs on
EXPOSE 3000

# Run the API using pnpm
CMD ["pnpm", "run", "start"]