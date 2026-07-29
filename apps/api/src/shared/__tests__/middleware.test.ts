import { describe, expect, test } from "bun:test"
import { createHealthRoutes } from "#routes/health.ts"
import { createRequireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

describe("createRequireSession", () => {
  test("rejects an anonymous request", async () => {
    const app = factory.createApp().get(
      "/private",
      createRequireSession(() => Promise.resolve(null)),
      (context) => context.text("private")
    )

    const response = await app.request("/private")

    expect(response.status).toBe(401)
  })
})

describe("createHealthRoutes", () => {
  test("returns ok when the database check succeeds", async () => {
    const app = createHealthRoutes(() => Promise.resolve())

    const response = await app.request("/")

    expect(response.status).toBe(200)
    expect(await response.text()).toBe("ok")
  })
})
