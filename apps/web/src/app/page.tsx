"use client"

import { Button } from "@this/ui/components/button"
import { authClient, useSession } from "~/lib/auth"

export default function Home() {
  const { data } = useSession()

  return (
    <div className="">
      <h1>This is a heading</h1>

      <Button
        onClick={async () => {
          await authClient.admin.impersonateUser({
            userId: "2",
          })
        }}
      >
        Sign up
      </Button>
      <h2>Drizzle</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
