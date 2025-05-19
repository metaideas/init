import { createProviderRegistry } from "ai"

// Import providers as needed: https://ai-sdk.dev/providers/ai-sdk-providers
import { openai } from "@ai-sdk/openai"

export const registry = createProviderRegistry({
  openai,
})

export { createOpenAI, openai } from "@ai-sdk/openai"
