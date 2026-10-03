<div align="center">
  <h1 align="center"><code>@init/observability</code></h1>
</div>

Observability package built with [evlog](https://evlog.dev/), [Sentry](https://sentry.io/), and [OpenStatus](https://openstatus.dev/).

## API tracing

The Hono API installs `traceRequest()` after `requestLogger()`. Each request gets
an isolated Sentry context, continues incoming `sentry-trace` and `baggage` headers,
and records the matched route pattern and HTTP outcome. Its wide event includes
`traceId` and `spanId`; evlog's Sentry drain uses `traceId` to associate the log
with the trace. Unmatched requests and route parameters do not create unique span names.

tRPC's public procedure installs `traceProcedure()` before authentication.
Each procedure gets a child span and its own wide event, with the HTTP event's
request ID in `parentRequestId`. `ctx.log` enriches the procedure event. This
keeps parallel batches separate and lets streaming procedures emit after the HTTP
event has finished. REST handlers continue enriching the HTTP event with `c.var.log`.

Procedure failures are read from `result.ok`, even when HTTP status is successful.
Expected tRPC errors produce warning events; internal errors are logged and
captured in Sentry once by the procedure wrapper. Hono's global error handler
continues owning exception capture for REST handlers. Procedure middleware covers
resolver execution, not the lifetime of subscription streams or deferred output.

Use named spans for useful business operations:

```ts
import { trace } from "@init/observability/tracing"

const profiles = await trace("Profiles.query", () => db.query.profiles.findMany())
ctx.log.set({ profiles: { count: profiles.length } })
```

`startSpan` is also exported for operations that need custom span attributes or
outcomes. Avoid recording raw inputs, response bodies, or credentials. Browser
clients must opt into Sentry trace propagation for the API origin; its CORS policy
accepts the tracing headers. Incoming headers continue traces but do not authenticate callers.

Tracing uses the existing Sentry configuration and sampling rate. No new account
or environment variable is required, and local requests still work without a DSN.
Wide-event sampling and trace sampling are independent: a log can refer to a trace
that was not retained. Automatic Bun database instrumentation is not assumed;
explicit function spans work regardless of database instrumentation support.
