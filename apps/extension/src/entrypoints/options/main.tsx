import { RouterProvider } from "@tanstack/react-router"
import React from "react"
import ReactDOM from "react-dom/client"

import "~/assets/styles/tailwind.css"
import { createRouter } from "~/router"

const router = createRouter(["/options"])

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
