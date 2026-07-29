import { mutationOptions } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

export type LocalTextFile = {
  contents: string
  path: string
}

export const openTextFileOptions = mutationOptions({
  mutationFn: async (): Promise<LocalTextFile | null> => {
    const selectedPath = await open({
      filters: [
        {
          extensions: ["json", "md", "txt"],
          name: "Text",
        },
      ],
      multiple: false,
    })

    if (!selectedPath) return null

    return {
      contents: await invoke<string>("read_text_file", { path: selectedPath }),
      path: selectedPath,
    }
  },
  mutationKey: ["local-files", "open"],
})

export const saveTextFileOptions = mutationOptions({
  mutationFn: async ({ contents, path }: LocalTextFile) => {
    await invoke("write_text_file", { contents, path })
  },
  mutationKey: ["local-files", "save"],
})
