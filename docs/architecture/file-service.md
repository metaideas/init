---
title: File Service
description: Understand the authenticated gateway for the Files SDK, local S3-compatible storage, and the security boundaries.
---

When you select `apps/api`, it includes an authenticated Files SDK gateway at
`/files`.

## Composition

`apps/api/src/shared/files.ts` combines the Files SDK with Bun's native S3 adapter. Local
development uses the MinIO service in `infra/local/docker-compose.yml`. Deployments
can provide compatible S3 configuration through environment validation in the API
workspace.

The gateway is part of the API workspace when you select it. The local `files-client`
generator creates optional, copy-once client integrations.

## Security boundaries

- Every gateway operation requires an existing init session.
- Object keys use the `users/<user-id>/` scope. A caller cannot select the prefix of another user.
- Uploads accept images and PDF documents by default. They have a limit of 10 MiB.
- Browser applications call the gateway. They do not receive storage credentials.
- Filter provider errors and metadata before they cross the trust boundary.

Changes to accepted content, size limits, key scoping, or authentication alter the
application's security policy. Record each change in an application decision record.
