import { describe, expect, test } from "bun:test"
import * as z from "@init/utils/schema"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createRouter, publicProcedure } from "#shared/trpc.ts"

const router = createRouter({
  echo: publicProcedure
    .input(
      z
        .object({ email: z.email(), name: z.string().min(1) })
        .refine((value) => value.name !== "Taken", "Form error")
    )
    .query(({ input }) => input),
})

async function query(input: unknown) {
  const response = await fetchRequestHandler({
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Validation fails before any procedure reads the context.
    createContext: () => ({}) as never,
    endpoint: "/trpc",
    req: new Request(
      `http://localhost/trpc/echo?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    ),
    router,
  })

  return (await response.json()) as { error: { json: { data: { zodError: unknown } } } }
}

describe("errorFormatter", () => {
  test("flattens input validation errors into zodError", async () => {
    const body = await query({ email: "user", name: "" })

    expect(body.error.json.data.zodError).toEqual({
      fieldErrors: {
        email: ["Invalid email address"],
        name: ["Too small: expected string to have >=1 characters"],
      },
      formErrors: [],
    })
  })

  test("reports object refinements as form errors", async () => {
    const body = await query({ email: "user@example.com", name: "Taken" })

    expect(body.error.json.data.zodError).toEqual({ fieldErrors: {}, formErrors: ["Form error"] })
  })
})
