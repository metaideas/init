import { createLazyFileRoute } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"

import { Button } from "@init/ui/button"
import { Input } from "@init/ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTRPC } from "~/shared/trpc"

export const Route = createLazyFileRoute("/")({
  component: Index,
})

function Index() {
  const [name, setName] = useState("")
  const greet = useMutation({
    mutationFn: () => invoke<string>("greet", { name }),
  })
  const trpc = useTRPC()
  const { data } = useQuery(trpc.hello.queryOptions())

  return (
    <div className="p-2">
      <h3>Welcome to the home page of your desktop app!</h3>
      <p>{data?.message}</p>
      <form
        className="row"
        onSubmit={e => {
          e.preventDefault()
          greet.mutate()
        }}
      >
        <Input
          id="greet-input"
          onChange={e => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <Button type="submit">Greet</Button>
      </form>
      <p>{greet.data}</p>
    </div>
  )
}
