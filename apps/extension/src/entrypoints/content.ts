import { defineContentScript } from "wxt/sandbox"

export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("Hello content.")
  },
})
