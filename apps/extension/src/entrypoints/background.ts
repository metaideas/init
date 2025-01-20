import { registerTestService } from "@/lib/services"
import { browser } from "wxt/browser"
import { defineBackground } from "wxt/sandbox"

export default defineBackground(() => {
  console.info("Hello background!", { id: browser.runtime.id })
  registerTestService()
})
