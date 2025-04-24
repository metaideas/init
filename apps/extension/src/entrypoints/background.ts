import { browser } from "wxt/browser"
import { defineBackground } from "#imports"

import { registerTestService } from "~/shared/services"

export default defineBackground(() => {
  console.info("Hello background!", { id: browser.runtime.id })
  registerTestService()
})
