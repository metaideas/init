import { createClient } from "api/client"

const client = createClient("http://localhost:8787")

export default async function Home() {
  const res = await client.users.$get()

  const users = await res.json()

  return (
    <div className="">
      <h1>This is a heading</h1>

      <h2>Drizzle</h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  )
}
