import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from "@tanstack/react-router"
import React from "react"
import ReactDOM from "react-dom/client"

import { routeTree } from "~/routeTree.gen"

const history = createMemoryHistory()

const router = createRouter({ routeTree, history })

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
