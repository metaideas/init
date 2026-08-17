---
title: Desktop Behavior
description: Understand the local-first Electron desktop boundary in init and optional connectivity to a remote backend.
---

`apps/desktop` is an Electron Forge application. It has a TanStack Router renderer and an
Electron main process.

The starter is local-first. Native file selection and persistence demonstrate the desktop
boundary. They do not require authentication, a remote API, or a hosted backend. Renderer
code is in `apps/desktop/src/renderer`. The main process and preload script in
`apps/desktop/src/shell` control privileged operating-system behavior. The renderer runs
with context isolation and without Node.js integration. It reaches native behavior only
through the typed `window.desktop` bridge that the preload script exposes. Renderer code
imports only `#shared` and `#features`, never `#shell`. Do not use browser-only
assumptions for this behavior.

Run the local `connect-backend` generator to add optional Hono or tRPC connectivity.
Desktop adapters use explicit public API URLs. They do not enable the cookie-based
authentication flow that browser applications use. Treat remote connectivity as an
addition to the local desktop capability, not a prerequisite to launch the application.
