import { defineContentScript } from "wxt/utils/define-content-script"

export default defineContentScript({
  main() {
    // Content script code goes here
  },
  matches: ["*://*.google.com/*"],
})
