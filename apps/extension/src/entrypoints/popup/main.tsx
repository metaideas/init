import React from "react"
import ReactDOM from "react-dom/client"
import App from "~/entrypoints/popup/App.tsx"
import "~/assets/styles/tailwind.css"

const rootElement = document.getElementById("root") as HTMLElement

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
