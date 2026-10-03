---
title: Package Guidance
description: Understand the shared package workspaces, hosted backend package, key-value storage, and workflow conventions in init.
---

Shared libraries and hosted backends are in `packages/`. Application workspaces consume them through workspace dependencies. Package names use the configured scope of the project.

Use `bun template add package <name>` to restore an available package workspace that setup removed. See [Project structure](./project-structure.md) for the full package catalog.

## Convex Backend

`packages/backend` is a hosted backend built with Convex and Better Auth. Application workspaces consume its generated API types and React client as a package workspace. Convex deploys the functions independently.

Use the `connect-backend` skill in `.agents/skills/` to add the client, environment, provider, and optional example connections to `apps/app`, `apps/desktop`, or `apps/mobile`. It does not deploy Convex or create credentials.

Run `bun run --filter @init/backend dev` to connect the package to a Convex deployment.

### Structure

- `src/client/` — React client and auth adapters
- `src/functions/public/` — public queries and mutations
- `src/functions/system/` — operational functions such as health checks
- `src/functions/shared/` — middleware, auth, logging, and environment configuration
- `src/functions/_generated/` — generated API and data-model types

## Email

`packages/email` renders [React Email](https://react.email/) templates and delivers them through a transport. An application workspace creates one mailer in its composition root and passes it where email is sent:

```ts
import { createMailer } from "@init/email/mailer"
import { selectTransport } from "@init/email/transports"

export const mailer = createMailer({
  from: ENV.EMAIL_FROM,
  logger: log,
  transport: selectTransport({ resendApiKey: ENV.RESEND_API_KEY, smtpUrl: ENV.SMTP_URL }),
})

await mailer.send("password-reset", { appName, resetUrl }, { to: [user.email] })
```

Each template registers its subject in `src/registry.ts`, so `send` type-checks the template name and its props. `selectTransport` uses Resend when `RESEND_API_KEY` is set and SMTP otherwise. Locally, `SMTP_URL` points at Mailpit from Docker Compose, which keeps every message and shows it at http://localhost:8005. Tests pass `memoryTransport()` and read the `sent` array.

`send` retries temporary failures, such as a dropped connection or a rate limit, with exponential backoff under one deadline. It reuses one idempotency key across the retries of a send, so Resend never delivers the same message twice. A failure that a retry cannot fix, such as an invalid sender, fails on the first attempt. `send` returns a failed delivery as a `SendEmailError` value instead of throwing, with the transport error as its `cause`. Pass `attempts` and `timeoutMs` to `createMailer` to change the policy.

## Key-Value Storage

`packages/kv` provides key-value storage through [unstorage](https://unstorage.unjs.io/). By default, it uses the Redis driver of unstorage.

Build keys with the package's key helpers rather than concatenating strings, and give each feature its own namespace. Values must be JSON-serializable; dates come back as strings.

To use another backend, change the unstorage driver in the package's client module. Callers do not change.

## Workflows

`packages/workflows` runs durable background workflows through [DBOS](https://docs.dbos.dev/). DBOS stores workflow inputs, step outputs, and queues in a `dbos` schema in Postgres, so workflows need a Postgres database. It runs inside the application process: there is no separate workflow server, signing key, or hosted account.

An application workspace creates one `Workflows` instance per process. Pass a `url`, and workflows open their own small connection pool. Pass the application's logger as `logger` to receive workflow events; without it, DBOS logs to the console:

```ts
import { Workflows } from "@init/workflows/client"

export const workflows = new Workflows({
  logger: log,
  poolSize: 5,
  queues: { default: { concurrency: 10 } },
  url: ENV.DATABASE_URL,
})
```

The separate pool keeps workflow traffic and request traffic from waiting on each other's connections. It adds `poolSize` connections to each process, and DBOS holds one of them open to listen for notifications. When a Postgres connection limit is tight, pass a `pg` `Pool` as `pool` instead, and workflows share it.

Define every workflow before `workflows.launch()`. Each `step` result is saved, so after a crash the workflow resumes from the first step that did not finish. A step can run more than once, so keep its side effects idempotent. `sleep` is durable across restarts.

```ts
export const greetUser = workflows.define("greetUser", async ({ userId }: { userId: string }) => {
  const greeting = await workflows.step("composeGreeting", () => `Hello, ${userId}`, {
    attempts: 3,
  })

  await workflows.sleep(1000)

  return { greeting }
})

await workflows.run(greetUser, { userId }, { id: `greet-${userId}`, queue: "default" })
```

Runs with the same `id` execute once. `queue` limits how many runs of that queue execute at once. Call `workflows.shutdown()` before the process exits.

Run workflows in a single process per application version. Every process uses the same DBOS executor ID, and on startup a process resumes every unfinished run of its version, including runs that another process is still executing. A second API instance, or a restart or deploy that starts the new process before the old one stops, can therefore execute the same steps twice. Stop the old process before the new one starts. Running several instances needs a distinct executor ID per process and a plan to recover the runs of a process that stops for good, such as [DBOS Conductor](https://docs.dbos.dev/production/conductor).

DBOS tags each run with an application version, which defaults to a hash of the workflow code, and recovers only runs that match the current version. After a deploy that changes workflow code, runs that the previous version left unfinished do not resume on their own. Keep a process on the previous version until they drain, or move them to the new version. See [Upgrading Workflow Code](https://docs.dbos.dev/typescript/tutorials/upgrading-workflows).

`bun run --filter @init/workflows reset` drops the local `dbos` schema, which removes workflow runs, queues, and history. Resetting the database clears only the application tables, so reset workflows with it. Otherwise unfinished runs resume against the new data. Stop the API first. It recreates the schema the next time it launches.
