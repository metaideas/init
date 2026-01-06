import { createProviderRegistry } from "ai"

// Add providers here
import { openai } from "@ai-sdk/openai"

export const registry = createProviderRegistry({
  openai,
})
