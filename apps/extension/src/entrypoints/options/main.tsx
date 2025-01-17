import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router"
import React from "react"
import ReactDOM from "react-dom/client"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"

import "~/assets/styles/tailwind.css"

const history = createMemoryHistory({
  initialEntries: ["/"],
})

// Create a new router instance
const router = createRouter({ routeTree, history })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root") as HTMLElement

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
