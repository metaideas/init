---
title: Desktop Behavior
description: Understand init's local-first Tauri desktop boundary and optional remote backend connectivity.
---

`apps/desktop` is a Tauri application with a TanStack Router frontend and a Rust native
shell.

The starter is local-first: native file selection and persistence demonstrate the
desktop boundary without requiring authentication, a remote API, or a hosted backend.
Webview code lives under `apps/desktop/src`; privileged operating-system behavior stays
behind Tauri commands and capabilities rather than browser-only assumptions.

Optional Hono or tRPC connectivity is added through the local `connect-backend`
generator. Desktop adapters use explicit public API URLs and do not enable the
cookie-based auth flow used by browser applications. Treat remote connectivity as an
addition to the local desktop capability, not a prerequisite for launching the app.
