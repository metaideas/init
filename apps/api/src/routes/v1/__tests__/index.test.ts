import { describe, expect, mock, test } from "bun:test"
import { generateSpecs } from "hono-openapi"
import { createFactory } from "hono/factory"

// The real module reads the environment at import time.
void mock.module("#shared/utils.ts", () => ({ factory: createFactory() }))

const { default: v1 } = await import("#routes/v1/index.ts")

describe("v1 OpenAPI document", () => {
  test("describes the /hello query and response", async () => {
    const specs = await generateSpecs(v1)

    expect(specs.paths["/hello"]?.get).toEqual({
      description: "Say hello to the user",
      operationId: "getHello",
      parameters: [{ in: "query", name: "name", schema: { type: "string" } }],
      responses: {
        200: {
          content: { "text/plain": { schema: { type: "string" } } },
          description: "Successful response",
        },
      },
    })
  })
})
