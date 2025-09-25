import { mutationOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"

export const demoOptions = mutationOptions({
  mutationKey: ["demo"],
  mutationFn: (name: string) => invoke<string>("greet", { name }),
})
