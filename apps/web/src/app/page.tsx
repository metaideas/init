import db, { type OrganizationId } from "@this/supabase/db"
import { createClient } from "@this/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const drizzleOrgs = await db.query.organizations.findMany({
    where: (model, { eq }) => eq(model.id, 2 as unknown as OrganizationId),
  })
  const supaOrgs = await supabase.from("organizations").select("*").eq("id", 2)

  return (
    <div className="">
      <h1>This is a heading</h1>
      <h2>Drizzle</h2>
      <pre>
        {JSON.stringify(
          drizzleOrgs,
          (_, value) => {
            if (typeof value === "bigint") {
              return value.toString()
            }
            return value
          },
          2
        )}
      </pre>
      <h2>Supabase</h2>
      <pre>
        {JSON.stringify(
          supaOrgs,
          (_, value) => {
            if (typeof value === "bigint") {
              return value.toString()
            }
            return value
          },
          2
        )}
      </pre>
    </div>
  )
}
