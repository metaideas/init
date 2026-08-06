---
title: Desktop Behavior
description: Understand the local-first Tauri desktop boundary in init and optional connectivity to a remote backend.
---

`apps/desktop` is a Tauri application. It has a TanStack Router frontend and a Rust
native shell.

The starter is local-first. Native file selection and persistence demonstrate the desktop
boundary. They do not require authentication, a remote API, or a hosted backend. Webview
code is in `apps/desktop/src`. Tauri commands and capabilities control privileged
operating-system behavior. Do not use browser-only assumptions for this behavior.

Run the local `connect-backend` generator to add optional Hono or tRPC connectivity.
Desktop adapters use explicit public API URLs. They do not enable the cookie-based
authentication flow that browser applications use. Treat remote connectivity as an
addition to the local desktop capability, not a prerequisite to launch the application.
