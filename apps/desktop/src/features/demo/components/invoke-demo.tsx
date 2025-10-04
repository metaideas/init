import { Button } from "@init/ui/components/button"
import { Input } from "@init/ui/components/input"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { demoOptions } from "~/features/demo/mutations"

export default function InvokeDemo() {
  const [name, setName] = useState("")
  const greet = useMutation({
    ...demoOptions,
    onSuccess: () => {
      setName("")
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          greet.mutate(name)
        }}
      >
        <Input
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
          value={name}
        />
        <Button type="submit">Greet</Button>
      </form>
      <p>{greet.data}</p>
    </div>
  )
}
