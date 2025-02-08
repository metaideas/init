import { defineContentScript } from "wxt/sandbox"

export default defineContentScript({
  main() {
    console.log("Hello content.")
  },
  matches: ["*://*.google.com/*"],
})
