`# `@init/observability`

Logging, error and uptime monitoring for your application.

## About

This package contains three main parts:

- `logger` - Logging using pino and [Axiom](https://axiom.co).
- `error` - Error monitoring using [Sentry](https://sentry.io).
- `uptime` - Uptime monitoring using [OpenStatus](https://openstatus.dev).

## Usage

### Logger

There are two ways you can use the logger:

- Use the default export inside `logger/index.ts` and log normally throughout
  your application (server-side only). No additional setup is needed.
  - Depending on where you are hosting your application, you may be able to send
    these logs to Axiom through a log drain or through the [`@axiomhq/pino`](https://axiom.co/docs/guides/pino) package.
- Use the `logger/axiom` packages to send logs to Axiom. Useful for capturing
  client-side logs and for use in hosting providers where log drains are expensive (like
  Vercel.)

