import * as z from "@init/utils/schema"
import { describeRoute, resolver, validator } from "hono-openapi"
import { getRequestLocale } from "#shared/internationalization.ts"
import { m } from "#shared/internationalization/messages.js"
import { requireSession } from "#shared/middleware.ts"
import { factory } from "#shared/utils.ts"

export default factory
  .createApp()
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
      const locale = getRequestLocale(c.req.header("Accept-Language"))
      return c.text(m.api_greeting({ name: query.name ?? "Hono" }, { locale }))
    }
  )
  .get("/me", requireSession, (c) => c.json(c.var.session.user))
