import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router"

import "@init/ui/globals.css"

import PopupDemo from "~/features/demo/components/popup-demo"
import SettingsDemo from "~/features/demo/components/settings-demo"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route index element={<PopupDemo />} />
          <Route path="/settings" element={<SettingsDemo />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  )
}
