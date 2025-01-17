import { db } from "@this/db/client"
import { users } from "@this/db/schema"
import { AdminOnly, UserOnly } from "~/components/auth/roles"
import { validateRequest } from "~/lib/auth/helpers"

export default async function Home() {
  const session = await validateRequest()
  const existingUsers = await db.select().from(users)

  return (
    <div>
      <h1 className="font-bold text-2xl">This is a heading</h1>

      <h2>Drizzle</h2>
      <pre>{JSON.stringify(existingUsers, null, 2)}</pre>
      <h2>Auth Session</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <UserOnly>You are only seeing this if you are a user</UserOnly>
      <AdminOnly>You are only seeing this if you are an admin</AdminOnly>
    </div>
  )
}
