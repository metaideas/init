import { logger } from "@init/observability/logger"
import { browser } from "wxt/browser"
import { defineBackground } from "wxt/utils/define-background"
import { registerTestService } from "#shared/services.ts"

export default defineBackground(() => {
  logger.with({ id: browser.runtime.id })
    .info`Hello from the background script!`

  registerTestService()
})
