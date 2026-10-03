import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test"
import * as Sentry from "@sentry/node"
import { Hono } from "hono"
import type { LoggerVariables } from "#logger/hono.ts"
import type { WideEvent } from "#logger/index.ts"
import { requestLogger } from "#logger/hono.ts"
import { createRequestLogger, initLogger } from "#logger/index.ts"
import { traceRequest } from "#tracing/hono.ts"
import { trace } from "#tracing/index.ts"
import { traceProcedure } from "#tracing/rpc.ts"

const events: WideEvent[] = []
const spans: Sentry.Span[] = []
let errorReports = 0

beforeAll(() => {
  initLogger({
    drain: ({ event }) => {
      events.push(event)
    },
    env: { service: "tracing-test" },
    silent: true,
  })
  Sentry.init({
    beforeSend: () => {
      errorReports += 1
      return null
    },
    defaultIntegrations: false,
    dsn: "https://public@example.invalid/1",
    tracesSampleRate: 1,
    transport: () => ({
      flush: () => Promise.resolve(true),
      send: () => Promise.resolve({}),
    }),
  })
})

beforeEach(() => {
  events.length = 0
  spans.length = 0
  errorReports = 0
})

afterAll(async () => {
  await Sentry.close()
})

function app() {
  return new Hono<LoggerVariables>().use(requestLogger()).use(traceRequest())
}

function recordedSpan(index: number) {
  const span = spans[index]
  if (!span) {
    throw new Error("Missing recorded span")
  }
  return span
}

function activeSpan() {
  const span = Sentry.getActiveSpan()
  if (!span) {
    throw new Error("Missing active span")
  }
  spans.push(span)
  return span
}

describe("traceRequest", () => {
  test("continues incoming traces, names routes without IDs, and links wide events", async () => {
    const server = app().get("/profiles/:id", async (c) => {
      activeSpan()
      await trace("Profiles.query", () => {
        activeSpan()
        return Promise.resolve()
      })
      return c.json({ ok: true })
    })
    const traceId = "12345678901234567890123456789012"
    await server.request("/profiles/private-id", {
      headers: { "sentry-trace": `${traceId}-1234567890123456-1` },
    })
    expect(spans[0]?.spanContext().traceId).toBe(traceId)
    expect(Sentry.spanToJSON(recordedSpan(0)).description).toBe("GET /profiles/:id")
    expect(Sentry.spanToJSON(recordedSpan(1)).parent_span_id).toBe(spans[0]?.spanContext().spanId)
    expect(events[0]?.traceId).toBe(traceId)
  })

  test("isolates overlapping request spans and logging context", async () => {
    const { promise: ready, resolve: release } = Promise.withResolvers<undefined>()
    const server = app().get("/:id", async (c) => {
      const span = activeSpan()
      c.var.log.set({ id: c.req.param("id") })
      if (c.req.param("id") === "first") {
        await ready
      } else {
        release()
      }
      expect(Sentry.getActiveSpan()).toBe(span)
      return c.text("ok")
    })
    await Promise.all([server.request("/first"), server.request("/second")])
    expect(new Set(events.map((event) => event.traceId)).size).toBe(2)
    expect(
      events.map((event) => event.id).toSorted((a, b) => String(a).localeCompare(String(b)))
    ).toEqual(["first", "second"])
  })

  test("marks errors handled by Hono as failed spans", async () => {
    const server = app()
      .get("/failure", () => {
        activeSpan()
        throw new Error("boom")
      })
      .onError((_error, c) => c.text("failed", 500))
    const response = await server.request("/failure")
    expect(response.status).toBe(500)
    expect(Sentry.spanToJSON(recordedSpan(0)).status).toBe("internal_error")
  })
})

describe("traceProcedure", () => {
  test("keeps parallel procedure events separate even after the HTTP logger emits", async () => {
    const parentLog = createRequestLogger({ requestId: "batch" })
    parentLog.emit()
    const failure = {
      error: Object.assign(new Error("denied"), { code: "UNAUTHORIZED" }),
      ok: false as const,
    }
    const success = { data: "ok", ok: true as const }

    const { promise: ready, resolve: release } = Promise.withResolvers<undefined>()
    await Sentry.startSpan({ name: "batch" }, async () => {
      await Promise.all([
        traceProcedure({ parentLog, path: "profiles.list", type: "query" }, async (log) => {
          activeSpan()
          log.set({ profiles: { count: 3 } })
          await ready
          return success
        }),
        traceProcedure({ parentLog, path: "auth.check", type: "query" }, () => {
          activeSpan()
          release()
          return failure
        }),
      ])
    })
    const procedureEvents = events.filter((event) => event.event === "rpc.procedure")
    expect(procedureEvents).toHaveLength(2)
    expect(
      procedureEvents
        .map((event) => event.outcome)
        .toSorted((a, b) => String(a).localeCompare(String(b)))
    ).toEqual(["failure", "success"])
    expect(procedureEvents.every((event) => event.parentRequestId === "batch")).toBe(true)
    expect(new Set(procedureEvents.map((event) => event.traceId)).size).toBe(1)
    expect(new Set(procedureEvents.map((event) => event.spanId)).size).toBe(2)
    expect(Sentry.spanToJSON(recordedSpan(1)).status).toBe("unknown_error")
    await Sentry.flush()
    expect(errorReports).toBe(0)
  })

  test("captures internal procedure failures once and preserves the result", async () => {
    const parentLog = createRequestLogger()
    const result = {
      error: Object.assign(new Error("database failed"), { code: "INTERNAL_SERVER_ERROR" }),
      ok: false as const,
    }
    const returned = await traceProcedure(
      { parentLog, path: "profiles.list", type: "query" },
      () => result
    )
    await Sentry.flush()
    expect(returned).toBe(result)
    expect(errorReports).toBe(1)
    expect(events[0]?.level).toBe("error")
  })

  test("emits a failure event and preserves a thrown error", async () => {
    const error = new Error("unexpected")
    const parentLog = createRequestLogger()
    const caught = await traceProcedure({ parentLog, path: "failure", type: "mutation" }, () => {
      throw error
    }).catch((error: unknown) => error)
    expect(caught).toBe(error)
    expect(events[0]?.outcome).toBe("failure")
  })
})

describe("traceRequest without a DSN", () => {
  test("serves local requests without a hosted account", async () => {
    await Sentry.close()
    Sentry.init({ defaultIntegrations: false })
    const server = app().get("/local", (c) => c.text("ok"))
    const response = await server.request("/local")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("ok")
  })
})
