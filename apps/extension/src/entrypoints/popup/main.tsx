import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { Route, Router, Switch } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"

import "@init/ui/globals.css"

import PopupDemo from "#features/demo/components/popup-demo.tsx"
import SettingsDemo from "#features/demo/components/settings-demo.tsx"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <Router hook={useHashLocation}>
        <Switch>
          <Route component={PopupDemo} path="/" />
          <Route component={SettingsDemo} path="/settings" />
        </Switch>
      </Router>
    </StrictMode>
  )
}
