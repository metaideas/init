import { db } from "@this/db/client"
import { sendEmail } from "@this/email"
import { createClient } from "@this/supabase/server"
import { Button } from "@this/ui/components/button"

export default async function Home() {
  const supabase = await createClient()
  const drizzleOrgs = await db.query.organizations.findMany()
  const supaOrgs = await supabase.from("organizations").select("*")

  return (
    <div className="">
      <h1>This is a heading</h1>
      <Button
        type="button"
        onClick={async () => {
          "use server"

          await sendEmail(
            "hi@init.now",
            "Testing email",
            <div>
              <h1>Hi there!</h1>
              <p>This is a test email</p>
            </div>
          )
        }}
      >
        Click me
      </Button>
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

export const runtime = "edge"
