import { createLazyFileRoute } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { useState } from "react"

import { Button } from "@this/ui/button"
import { Input } from "@this/ui/input"

export const Route = createLazyFileRoute("/")({
  component: Index,
})

function Index() {
  const [greetMsg, setGreetMsg] = useState("")
  const [name, setName] = useState("")

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }))
  }

  return (
    <div className="p-2">
      <h3>Welcome to the home page of your desktop app!</h3>

      <form
        className="row"
        onSubmit={e => {
          e.preventDefault()
          greet()
        }}
      >
        <Input
          id="greet-input"
          onChange={e => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <Button type="submit">Greet</Button>
      </form>
      <p>{greetMsg}</p>
    </div>
  )
}
