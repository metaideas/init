// Import providers as needed: https://ai-sdk.dev/providers/ai-sdk-providers
import { openai } from "@ai-sdk/openai"
import { createProviderRegistry } from "ai"

export const registry = createProviderRegistry({
  openai,
})

export { createOpenAI, openai } from "@ai-sdk/openai"
