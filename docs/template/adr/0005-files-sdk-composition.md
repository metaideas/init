# 0005: Build Files SDK into the API and generate clients

## Status

Accepted

## Decision

Include the authenticated Files SDK gateway in a selected `apps/api` workspace. Keep
application clients optional. Install them through the local `files-client`
template command.

Use Bun's S3 adapter with local MinIO defaults so the API works without a cloud storage
account. Enforce session authentication, per-user object prefixes, content-type limits,
and upload size limits at the gateway.

## Consequences

Scaffolded projects that select the API receive one secure server composition. They add
client dependencies and source code only to application workspaces that need file access. Generated
client code becomes owned by the scaffolded project.
