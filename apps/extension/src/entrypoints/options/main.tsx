import { RouterProvider } from "@tanstack/react-router"
import React from "react"
import ReactDOM from "react-dom/client"

import { createRouter } from "~/router"

import "~/assets/styles/tailwind.css"

const router = createRouter(["/options"])

const rootElement = document.getElementById("root") as HTMLElement

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
