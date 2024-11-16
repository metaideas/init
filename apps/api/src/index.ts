import type { db } from "@this/db/client"
import type { SupabaseClient } from "@this/supabase/types"
import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"

import { withDb, withSupabase } from "~/middleware"

const app = new Hono<{
  Bindings: CloudflareBindings
  Variables: { supabase: SupabaseClient; db: typeof db }
}>()

app.use(async (c, next) => {
  process.env = c.env
  await next()
})

app.use(contextStorage())

app.use(withDb)
app.use(withSupabase)

app
  .get("/", async c => {
    const { data } = await c.var.supabase.from("organizations").select("*")
    const orgs = await c.var.db.query.organizations.findMany()

    return c.json({
      supabase: data?.map(data => data.public_id),
      db: orgs.map(org => org.publicId),
    })
  })
  .get("/ping", c => c.text("pong"))

export default app
