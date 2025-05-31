"use client"

import { useMutation } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"

import { Button } from "@init/ui/components/button"
import { Input } from "@init/ui/components/input"

import { useHello } from "~/features/demo/queries"

export default function InvokeDemo() {
  const [name, setName] = useState("")
  const greet = useMutation({
    mutationFn: () => invoke<string>("greet", { name }),
    onSuccess: () => {
      setName("")
    },
  })

  const { data } = useHello()

  return (
    <div className="flex flex-col gap-2">
      <p>{data?.message}</p>
      <form
        className="flex flex-row gap-2"
        onSubmit={e => {
          e.preventDefault()
          greet.mutate()
        }}
      >
        <Input
          id="greet-input"
          onChange={e => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          value={name}
        />
        <Button type="submit">Greet</Button>
      </form>
      <p>{greet.data}</p>
    </div>
  )
}
