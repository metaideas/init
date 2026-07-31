import { Button } from "@init/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@init/ui/components/card"
import { Textarea } from "@init/ui/components/textarea"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { openTextFileOptions, saveTextFileOptions } from "#features/local-files/mutations.ts"
import { m } from "#shared/internationalization/messages.js"

export default function FileEditor() {
  const [contents, setContents] = useState("")
  const [path, setPath] = useState<string>()
  const [savedBuffer, setSavedBuffer] = useState<{ contents: string; path: string }>()
  const saveFile = useMutation({
    ...saveTextFileOptions,
    onSuccess: (_, variables) => {
      setSavedBuffer(variables)
    },
  })
  const openFile = useMutation({
    ...openTextFileOptions,
    onSuccess: (file) => {
      if (!file) return
      saveFile.reset()
      setSavedBuffer(undefined)
      setContents(file.contents)
      setPath(file.path)
    },
  })
  const isSaved =
    saveFile.isSuccess && savedBuffer?.contents === contents && savedBuffer.path === path

  function save() {
    if (!path) return
    saveFile.mutate({ contents, path })
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{m.desktop_local_files_title()}</CardTitle>
        <CardDescription>{m.desktop_local_files_description()}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={openFile.isPending}
            onClick={() => {
              openFile.mutate()
            }}
            type="button"
          >
            {m.desktop_local_files_choose()}
          </Button>
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {path ?? m.desktop_local_files_empty_state()}
          </p>
        </div>

        {path ? (
          <>
            <Textarea
              aria-label={m.desktop_local_files_title()}
              className="min-h-80 resize-y font-mono text-base"
              onChange={(event) => {
                saveFile.reset()
                setContents(event.currentTarget.value)
              }}
              value={contents}
            />
            <div className="flex items-center gap-3">
              <Button disabled={saveFile.isPending} onClick={save} type="button">
                {m.desktop_local_files_save()}
              </Button>
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {isSaved ? m.desktop_local_files_saved_status() : null}
              </p>
            </div>
          </>
        ) : null}

        {openFile.error || saveFile.error ? (
          <p className="text-sm text-destructive" role="alert">
            {(openFile.error ?? saveFile.error)?.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
