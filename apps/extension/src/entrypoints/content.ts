import { defineContentScript } from "wxt/utils/define-content-script"

export default defineContentScript({
  main() {
    // biome-ignore lint/suspicious/noConsole: Testing
    console.log("Hello content.")
  },
  matches: ["*://*.google.com/*"],
})
