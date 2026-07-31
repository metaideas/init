import * as z from "@init/utils/schema"
import { describeRoute, resolver, validator } from "hono-openapi"
import filesRoutes from "#routes/v1/files.ts"
import { m } from "#shared/internationalization/messages.js"
import { requireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

export default factory
  .createApp()
  .route("/files", filesRoutes)
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
      return c.text(
        m.api_hello_greeting({ name: query.name ?? "Hono" }, { locale: c.var.language })
      )
    }
  )
  .get("/me", requireSession, (c) => c.json(c.var.session.user))
