import * as z from "@init/utils/schema"
import { describeRoute, resolver, validator } from "hono-openapi"
import { requireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

export default factory
  .createApp()
  .get("/", (c) => c.text("v1 API"))
  .get(
    "/hello",
    describeRoute({
      description: "Say hello to the user",
      responses: {
        200: {
          content: {
            "text/plain": {
              schema: resolver(z.string()),
            },
          },
          description: "Successful response",
        },
      },
    }),
    validator("query", z.object({ name: z.string().optional() })),
    (c) => {
      const query = c.req.valid("query")
      return c.text(`Hello ${query?.name ?? "Hono"}!`)
    }
  )
  .get("/me", requireSession, (c) => c.json(c.var.session.user))
