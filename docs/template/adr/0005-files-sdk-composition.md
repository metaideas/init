# 0005: Build Files SDK into the API and generate clients

## Status

Accepted

## Decision

Include the authenticated Files SDK gateway in a selected `apps/api` workspace. Keep
application clients optional and install them through the local `files-client`
generator.

Use Bun's S3 adapter with local MinIO defaults so the API works without a cloud storage
account. Enforce session authentication, per-user object prefixes, content-type limits,
and upload size limits at the gateway.

## Consequences

Projects selecting the API receive one secure server composition. Projects only add
client dependencies and source to the applications that need file access, and generated
client code becomes project-owned.
