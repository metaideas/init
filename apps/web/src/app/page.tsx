import { AdminOnly, UserOnly } from "~/components/auth/roles"
import { validateRequest } from "~/lib/auth/helpers"

export default async function Home() {
  const session = await validateRequest()

  return (
    <div className="">
      <h1>This is a heading</h1>

      <h2>Drizzle</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <UserOnly>You are only seeing this if you are a user</UserOnly>
      <AdminOnly>You are only seeing this if you are an admin</AdminOnly>
    </div>
  )
}
