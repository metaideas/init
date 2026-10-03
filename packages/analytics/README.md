<div align="center">
  <h1 align="center"><code>@init/analytics</code></h1>
</div>

Analytics package built with [PostHog](https://posthog.com/) and [Plausible](https://plausible.io/).

## Structure

```text
src/
  web/index.ts                   Plausible init and track exports
  product/
    server/index.ts              PostHog server constructor export
    react/
      index.ts                   Browser client, provider, and hook exports
      hooks.ts                   Browser provider and identification hook
    expo/
      index.ts                   Native constructor, provider, and hook exports
      hooks.ts                   Native provider and identification hook
  shared/use-identify-user.ts    Identification effect and user contract
```

Imports flow from public entrypoints to runtime hooks, then from hooks
to shared code. Runtime folders never import one another. Shared code depends on
React and the client identification contract, never on a PostHog SDK or runtime
folder.

Runtime folders isolate each SDK. Entrypoints export SDK clients or constructors;
hooks share the identification effect. Callers own initialization and configuration.

## Public imports

The package exposes SDK clients and constructors without factories or caches:

```ts
import { init, track } from "@init/analytics/web"

init({ domain: "example.com" })
track("Signup")
```

```ts
import { Analytics } from "@init/analytics/product/server"

const analytics = new Analytics(apiKey, { host, flushAt: 1, flushInterval: 0 })
```

```ts
import { analytics, AnalyticsProvider, useIdentifyUser } from "@init/analytics/product/react"

analytics.init(apiKey, {
  api_host: host,
  capture_pageview: "history_change",
  persistence: "localStorage+cookie",
  person_profiles: "identified_only",
})
```

Expo exports the `Analytics` constructor, `AnalyticsProvider`, `useAnalytics`, and
`useIdentifyUser` from `@init/analytics/product/expo`. Construct its client with
`new Analytics(apiKey, { host })`. Create server and native clients once in the
application workspace and pass browser or native clients to their provider.
