import { browser } from "wxt/browser"
import { defineBackground } from "wxt/utils/define-background"
import { log } from "#shared/logger.ts"

export default defineBackground({
  main: () => {
    log.info({ id: browser.runtime.id, message: "Hello from the background script!" })
  },
  type: "module",
})
