import { useEffect } from "react"
import { log } from "#shared/logger.ts"

export function useLogRenderError(error: unknown) {
  useEffect(() => {
    log.error({ error, message: "Route rendering failed" })
  }, [error])
}
