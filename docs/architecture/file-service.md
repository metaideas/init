---
title: File Service
description: Understand the authenticated Files SDK gateway, local S3-compatible storage, and its security boundaries.
---

When `apps/api` is selected, it includes an authenticated Files SDK gateway at
`/files`.

## Composition

`apps/api/src/shared/files.ts` composes the Files SDK with Bun's native S3 adapter. Local
development targets the MinIO service in `infra/local/docker-compose.yml`; deployments
can provide compatible S3 configuration through the API workspace's validated
environment.

The gateway is part of the selected API workspace. Application clients are optional,
copy-once integrations produced by the local `files-client` generator.

## Security boundaries

- Every gateway operation requires the existing init session.
- Object keys are scoped to `users/<user-id>/`; callers cannot select another user's
  prefix.
- Uploads default to images and PDF documents and are limited to 10 MiB.
- Browser applications call the gateway rather than receiving storage credentials.
- Provider errors and metadata should not cross the trust boundary without filtering.

Changing accepted content, size limits, key scoping, or authentication changes the
application's security policy and should be recorded in an application decision record.
