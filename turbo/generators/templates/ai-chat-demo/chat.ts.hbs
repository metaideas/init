import { createChat } from "@init/ai/helpers/ai-sdk"

const demoChat = createChat()
  .user("What makes this template useful for a new product?")
  .sleep(500)
  .assistant(
    "It starts with the unglamorous parts already connected: authentication, typed environment variables, observability, database access, reusable UI, and deployment-ready application workspaces. You can remove what you do not need and spend the first development cycle on product behavior instead of project wiring."
  )
  .user("How does the repository keep application code organized?")
  .sleep(500)
  .assistant(
    "Application workspaces use a one-way flow: shared modules can be used by features, and routes compose both. Features remain independent from one another, so product behavior stays local and cross-feature coupling does not slowly become the architecture."
  )
  .user("Can you summarize the attached project notes?", {
    files: [
      {
        filename: "project-notes.md",
        mediaType: "text/markdown",
        url: "data:text/markdown,The%20template%20uses%20Bun%2C%20TypeScript%2C%20Base%20UI%2C%20and%20workspace%20packages.",
      },
    ],
  })
  .sleep(650)
  .assistant(
    "The notes describe a Bun and TypeScript monorepo with Base UI-backed components and reusable workspace packages. The important design choice is that application workspaces own product flows while package workspaces hold capabilities with an independent lifecycle."
  )
  .user("How would I replace this demo with a real model?")
  .sleep(500)
  .assistant(
    "Keep the useChat interface and replace this scripted transport with an HTTP chat transport backed by a server route. The provider registry already lives in @init/ai/registry, so the server can choose a model without leaking provider credentials or provider-specific code into the browser."
  )

const initialDemoMessages = demoChat.get(0)
const demoChatTransport = demoChat.transport({ delayMs: 20 })

export { demoChat, demoChatTransport, initialDemoMessages }
